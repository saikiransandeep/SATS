const mongoose = require("mongoose")
require("dotenv").config()

// Import models
const AttendanceSession = require("../backend/models/AttendanceSession")
const AttendanceRecord = require("../backend/models/AttendanceRecord")
const Student = require("../backend/models/Student")
const Subject = require("../backend/models/Subject")
const Section = require("../backend/models/Section")
const User = require("../backend/models/User")
const SubjectAssignment = require("../backend/models/SubjectAssignment")

async function seedAttendanceData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart-attendance", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")

    // Clear existing attendance data
    console.log("🧹 Clearing existing attendance data...")
    await AttendanceSession.deleteMany({})
    await AttendanceRecord.deleteMany({})

    // Get required data
    const cseSectionB = await Section.findOne({ code: "CSE-B" })
    const cseSectionA = await Section.findOne({ code: "CSE-A" })
    const itSectionA = await Section.findOne({ code: "IT-A" })

    const dataStructures = await Subject.findOne({ code: "CS301" })
    const operatingSystems = await Subject.findOne({ code: "CS302" })
    const introProgramming = await Subject.findOne({ code: "CS101" })

    const profDavis = await User.findOne({ employeeId: "FAC001" })
    const drGrant = await User.findOne({ employeeId: "FAC002" })

    const studentsCSEB = await Student.find({ section: cseSectionB._id }).limit(45)
    const studentsCSEA = await Student.find({ section: cseSectionA._id }).limit(45)
    const studentsITA = await Student.find({ section: itSectionA._id }).limit(40)

    console.log("📊 Creating attendance sessions...")

    // Create sample attendance sessions for the past week
    const sessions = []
    const now = new Date()

    // Session 1: Data Structures - CSE-B (Yesterday)
    const session1Date = new Date(now)
    session1Date.setDate(session1Date.getDate() - 1)
    session1Date.setHours(10, 30, 0, 0)

    const session1 = new AttendanceSession({
      subject: dataStructures._id,
      section: cseSectionB._id,
      faculty: profDavis._id,
      date: session1Date,
      startTime: session1Date,
      endTime: new Date(session1Date.getTime() + 60 * 60 * 1000), // 1 hour later
      duration: 60,
      sessionType: "lecture",
      status: "completed",
      totalStudents: studentsCSEB.length,
      presentCount: 42,
      absentCount: 3,
      odCount: 0,
      unmarkedCount: 0,
      attendancePercentage: 93,
      isSubmitted: true,
      submittedAt: new Date(session1Date.getTime() + 65 * 60 * 1000),
    })

    await session1.save()
    sessions.push(session1)

    // Create attendance records for session 1
    const session1Records = []
    studentsCSEB.forEach((student, index) => {
      let status = "present"
      if (index === 1 || index === 15 || index === 22) status = "absent" // Bob Williams and 2 others absent

      session1Records.push({
        session: session1._id,
        student: student._id,
        status,
        markedAt: new Date(session1Date.getTime() + 10 * 60 * 1000), // 10 minutes after start
        markedBy: profDavis._id,
      })
    })

    await AttendanceRecord.insertMany(session1Records)

    // Session 2: Operating Systems - IT-A (2 days ago)
    const session2Date = new Date(now)
    session2Date.setDate(session2Date.getDate() - 2)
    session2Date.setHours(13, 0, 0, 0)

    const session2 = new AttendanceSession({
      subject: operatingSystems._id,
      section: itSectionA._id,
      faculty: drGrant._id,
      date: session2Date,
      startTime: session2Date,
      endTime: new Date(session2Date.getTime() + 60 * 60 * 1000),
      duration: 60,
      sessionType: "lecture",
      status: "completed",
      totalStudents: studentsITA.length,
      presentCount: 35,
      absentCount: 4,
      odCount: 1,
      unmarkedCount: 0,
      attendancePercentage: 70,
      isSubmitted: true,
      submittedAt: new Date(session2Date.getTime() + 65 * 60 * 1000),
    })

    await session2.save()
    sessions.push(session2)

    // Session 3: Intro to Programming - CSE-A (3 days ago)
    const session3Date = new Date(now)
    session3Date.setDate(session3Date.getDate() - 3)
    session3Date.setHours(9, 0, 0, 0)

    const session3 = new AttendanceSession({
      subject: introProgramming._id,
      section: cseSectionA._id,
      faculty: profDavis._id,
      date: session3Date,
      startTime: session3Date,
      endTime: new Date(session3Date.getTime() + 60 * 60 * 1000),
      duration: 60,
      sessionType: "lecture",
      status: "completed",
      totalStudents: studentsCSEA.length,
      presentCount: 48,
      absentCount: 12,
      odCount: 0,
      unmarkedCount: 0,
      attendancePercentage: 80,
      isSubmitted: false,
    })

    await session3.save()
    sessions.push(session3)

    // Create an active session for today
    const todaySession = new AttendanceSession({
      subject: dataStructures._id,
      section: cseSectionB._id,
      faculty: profDavis._id,
      date: now,
      startTime: new Date(now.getTime() - 15 * 60 * 1000), // Started 15 minutes ago
      sessionType: "lecture",
      status: "active",
      totalStudents: studentsCSEB.length,
      presentCount: 0,
      absentCount: 0,
      odCount: 0,
      unmarkedCount: studentsCSEB.length,
      attendancePercentage: 0,
      isSubmitted: false,
    })

    await todaySession.save()
    sessions.push(todaySession)

    // Create unmarked attendance records for today's session
    const todayRecords = studentsCSEB.map((student) => ({
      session: todaySession._id,
      student: student._id,
      status: "unmarked",
    }))

    await AttendanceRecord.insertMany(todayRecords)

    console.log("✅ Attendance data seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`- Attendance Sessions: ${sessions.length}`)
    console.log(`- Attendance Records: ${session1Records.length + todayRecords.length}`)
    console.log("- 1 Active session (Data Structures - CSE-B)")
    console.log("- 3 Completed sessions with historical data")
  } catch (error) {
    console.error("❌ Attendance seeding failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("👋 Disconnected from MongoDB")
  }
}

// Run the seeding
if (require.main === module) {
  seedAttendanceData()
}

module.exports = seedAttendanceData
