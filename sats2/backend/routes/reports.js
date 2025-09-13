const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const AttendanceRecord = require("../models/AttendanceRecord")
const AttendanceSession = require("../models/AttendanceSession")
const Student = require("../models/Student")
const User = require("../models/User")

// Get attendance summary statistics
router.get("/summary", auth, async (req, res) => {
  try {
    const { period = "month", classId, departmentId } = req.query

    // Calculate date range based on period
    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "semester":
        startDate = new Date(now.getFullYear(), now.getMonth() < 6 ? 0 : 6, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build query based on user role
    const sessionQuery = { date: { $gte: startDate } }

    if (req.user.role === "faculty") {
      sessionQuery.facultyId = req.user._id
    } else if (req.user.role === "class_incharge" && classId) {
      sessionQuery.classId = classId
    } else if (req.user.role === "hod" && departmentId) {
      sessionQuery.departmentId = departmentId
    }

    // Get attendance sessions
    const sessions = await AttendanceSession.find(sessionQuery)
    const sessionIds = sessions.map((s) => s._id)

    // Get attendance records
    const records = await AttendanceRecord.find({
      sessionId: { $in: sessionIds },
    })

    // Calculate statistics
    const totalRecords = records.length
    const presentRecords = records.filter((r) => r.status === "present").length
    const overallAttendance = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0

    // Get unique students
    const uniqueStudents = [...new Set(records.map((r) => r.studentId.toString()))]
    const totalStudents = uniqueStudents.length

    // Get low attendance students (below 75%)
    const lowAttendanceStudents = []
    for (const studentId of uniqueStudents) {
      const studentRecords = records.filter((r) => r.studentId.toString() === studentId)
      const studentPresent = studentRecords.filter((r) => r.status === "present").length
      const studentAttendance = studentRecords.length > 0 ? (studentPresent / studentRecords.length) * 100 : 0

      if (studentAttendance < 75) {
        const student = await Student.findById(studentId)
        if (student) {
          lowAttendanceStudents.push({
            ...student.toObject(),
            attendancePercentage: studentAttendance.toFixed(1),
          })
        }
      }
    }

    res.json({
      overallAttendance: Number.parseFloat(overallAttendance),
      totalStudents,
      totalSessions: sessions.length,
      lowAttendanceCount: lowAttendanceStudents.length,
      lowAttendanceStudents,
      period,
      dateRange: { startDate, endDate: now },
    })
  } catch (error) {
    console.error("Error generating attendance summary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get subject-wise attendance report
router.get("/subject-wise", auth, async (req, res) => {
  try {
    const { period = "month" } = req.query

    // Calculate date range
    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const sessionQuery = { date: { $gte: startDate } }

    if (req.user.role === "faculty") {
      sessionQuery.facultyId = req.user._id
    }

    const sessions = await AttendanceSession.find(sessionQuery).populate("subjectId")

    // Group by subject
    const subjectStats = {}

    for (const session of sessions) {
      const subjectName = session.subjectId?.name || "Unknown Subject"

      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          subject: subjectName,
          totalRecords: 0,
          presentRecords: 0,
          sessions: 0,
        }
      }

      subjectStats[subjectName].sessions++

      const records = await AttendanceRecord.find({ sessionId: session._id })
      subjectStats[subjectName].totalRecords += records.length
      subjectStats[subjectName].presentRecords += records.filter((r) => r.status === "present").length
    }

    // Calculate percentages
    const subjectReport = Object.values(subjectStats).map((stat) => ({
      ...stat,
      attendancePercentage:
        stat.totalRecords > 0 ? Number.parseFloat(((stat.presentRecords / stat.totalRecords) * 100).toFixed(1)) : 0,
    }))

    res.json(subjectReport)
  } catch (error) {
    console.error("Error generating subject-wise report:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get attendance trends (daily/weekly data for charts)
router.get("/trends", auth, async (req, res) => {
  try {
    const { period = "month", granularity = "daily" } = req.query

    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const sessionQuery = { date: { $gte: startDate } }

    if (req.user.role === "faculty") {
      sessionQuery.facultyId = req.user._id
    }

    const sessions = await AttendanceSession.find(sessionQuery).sort({ date: 1 })

    // Group by date
    const trendData = {}

    for (const session of sessions) {
      const dateKey =
        granularity === "daily"
          ? session.date.toISOString().split("T")[0]
          : `${session.date.getFullYear()}-W${Math.ceil(session.date.getDate() / 7)}`

      if (!trendData[dateKey]) {
        trendData[dateKey] = {
          date: dateKey,
          totalRecords: 0,
          presentRecords: 0,
          sessions: 0,
        }
      }

      trendData[dateKey].sessions++

      const records = await AttendanceRecord.find({ sessionId: session._id })
      trendData[dateKey].totalRecords += records.length
      trendData[dateKey].presentRecords += records.filter((r) => r.status === "present").length
    }

    // Calculate percentages and format for chart
    const trends = Object.values(trendData).map((data) => ({
      date: data.date,
      attendancePercentage:
        data.totalRecords > 0 ? Number.parseFloat(((data.presentRecords / data.totalRecords) * 100).toFixed(1)) : 0,
      sessions: data.sessions,
    }))

    res.json(trends)
  } catch (error) {
    console.error("Error generating attendance trends:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export attendance report
router.get("/export", auth, async (req, res) => {
  try {
    const { format = "json", period = "month", classId } = req.query

    // Get summary data
    const summaryResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api/reports/summary?period=${period}&classId=${classId || ""}`,
      {
        headers: { Authorization: req.headers.authorization },
      },
    )
    const summaryData = await summaryResponse.json()

    if (format === "json") {
      res.json(summaryData)
    } else {
      // For CSV format, you would implement CSV generation here
      res.status(400).json({ message: "CSV export not implemented yet" })
    }
  } catch (error) {
    console.error("Error exporting report:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
