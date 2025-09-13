const express = require("express")
const { body, validationResult } = require("express-validator")
const AttendanceSession = require("../models/AttendanceSession")
const AttendanceRecord = require("../models/AttendanceRecord")
const Student = require("../models/Student")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/attendance/session
// @desc    Create new attendance session
// @access  Private (Faculty)
router.post(
  "/session",
  [
    auth,
    body("subject").isMongoId(),
    body("section").isMongoId(),
    body("sessionType").isIn(["lecture", "lab", "tutorial", "seminar"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { subject, section, sessionType, notes } = req.body

      // Get total students in section
      const totalStudents = await Student.countDocuments({
        section,
        isActive: true,
      })

      // Create attendance session
      const session = new AttendanceSession({
        subject,
        section,
        faculty: req.user.id,
        startTime: new Date(),
        sessionType,
        totalStudents,
        notes,
      })

      await session.save()

      // Create attendance records for all students
      const students = await Student.find({ section, isActive: true })
      const attendanceRecords = students.map((student) => ({
        session: session._id,
        student: student._id,
        status: "unmarked",
      }))

      await AttendanceRecord.insertMany(attendanceRecords)

      // Populate session data
      await session.populate(["subject", "section", "faculty"])

      // Emit real-time update
      const io = req.app.get("io")
      io.to(`class-${section}`).emit("session-started", {
        sessionId: session._id,
        subject: session.subject.name,
        faculty: session.faculty.fullName,
        startTime: session.startTime,
      })

      res.status(201).json(session)
    } catch (error) {
      console.error("Create session error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   GET /api/attendance/session/:sessionId
// @desc    Get attendance session with records
// @access  Private
router.get("/session/:sessionId", auth, async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId).populate(["subject", "section", "faculty"])

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Get attendance records
    const records = await AttendanceRecord.find({ session: session._id }).populate(
      "student",
      "rollNumber name profilePhoto",
    )

    res.json({
      session,
      records,
    })
  } catch (error) {
    console.error("Get session error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/attendance/record/:recordId
// @desc    Update attendance record
// @access  Private (Faculty)
router.put("/record/:recordId", [auth, body("status").isIn(["present", "absent", "od"])], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { status, remarks, isLate, lateMinutes } = req.body

    const record = await AttendanceRecord.findById(req.params.recordId).populate("session student")

    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" })
    }

    // Check if session is still active
    if (record.session.status !== "active") {
      return res.status(400).json({ message: "Cannot modify attendance for completed session" })
    }

    // Update record
    record.status = status
    record.markedAt = new Date()
    record.markedBy = req.user.id
    record.remarks = remarks
    record.isLate = isLate || false
    record.lateMinutes = lateMinutes || 0

    await record.save()

    // Update session statistics
    await updateSessionStats(record.session._id)

    // Emit real-time update
    const io = req.app.get("io")
    io.to(`class-${record.session.section}`).emit("attendance-updated", {
      sessionId: record.session._id,
      studentId: record.student._id,
      status: record.status,
      timestamp: record.markedAt,
    })

    res.json(record)
  } catch (error) {
    console.error("Update record error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/attendance/session/:sessionId/submit
// @desc    Submit attendance session
// @access  Private (Faculty)
router.post("/session/:sessionId/submit", auth, async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId)

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    if (session.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Update session
    session.status = "completed"
    session.endTime = new Date()
    session.duration = Math.round((session.endTime - session.startTime) / (1000 * 60))
    session.isSubmitted = true
    session.submittedAt = new Date()

    await session.save()

    // Emit real-time update
    const io = req.app.get("io")
    io.to(`class-${session.section}`).emit("session-completed", {
      sessionId: session._id,
      endTime: session.endTime,
      attendancePercentage: session.attendancePercentage,
    })

    res.json({ message: "Attendance submitted successfully", session })
  } catch (error) {
    console.error("Submit session error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to update session statistics
async function updateSessionStats(sessionId) {
  const stats = await AttendanceRecord.aggregate([
    { $match: { session: sessionId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])

  const statMap = {}
  stats.forEach((stat) => {
    statMap[stat._id] = stat.count
  })

  await AttendanceSession.findByIdAndUpdate(sessionId, {
    presentCount: statMap.present || 0,
    absentCount: statMap.absent || 0,
    odCount: statMap.od || 0,
    unmarkedCount: statMap.unmarked || 0,
  })
}

module.exports = router
