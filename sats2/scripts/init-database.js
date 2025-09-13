const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("../backend/models/User")
const Department = require("../backend/models/Department")
const Section = require("../backend/models/Section")
const Subject = require("../backend/models/Subject")
const Student = require("../backend/models/Student")
const SubjectAssignment = require("../backend/models/SubjectAssignment")
const Holiday = require("../backend/models/Holiday")

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart-attendance", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")

    // Clear existing data (be careful in production!)
    console.log("🧹 Clearing existing data...")
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Section.deleteMany({}),
      Subject.deleteMany({}),
      Student.deleteMany({}),
      SubjectAssignment.deleteMany({}),
      Holiday.deleteMany({}),
    ])

    // Create Departments
    console.log("🏢 Creating departments...")
    const departments = await Department.insertMany([
      {
        name: "Computer Science & Engineering",
        code: "CSE",
        description: "Department of Computer Science and Engineering",
        establishedYear: 2000,
        contactInfo: {
          email: "cse@university.edu",
          phone: "+1-555-0101",
          office: "Block A, 3rd Floor",
        },
      },
      {
        name: "Information Technology",
        code: "IT",
        description: "Department of Information Technology",
        establishedYear: 2005,
        contactInfo: {
          email: "it@university.edu",
          phone: "+1-555-0102",
          office: "Block B, 2nd Floor",
        },
      },
      {
        name: "Basic Sciences & Humanities",
        code: "BSH",
        description: "Department of Basic Sciences and Humanities",
        establishedYear: 1995,
        contactInfo: {
          email: "bsh@university.edu",
          phone: "+1-555-0103",
          office: "Block C, 1st Floor",
        },
      },
    ])

    const cseDept = departments.find((d) => d.code === "CSE")
    const itDept = departments.find((d) => d.code === "IT")
    const bshDept = departments.find((d) => d.code === "BSH")

    // Create Users (Faculty)
    console.log("👥 Creating faculty users...")
    const users = await User.insertMany([
      {
        employeeId: "FAC001",
        email: "professor.davis@university.edu",
        password: await bcrypt.hash("password123", 12),
        fullName: "Professor Davis",
        role: "faculty",
        department: cseDept._id,
        profilePhoto: "/diverse-professor-lecturing.png",
      },
      {
        employeeId: "FAC002",
        email: "dr.grant@university.edu",
        password: await bcrypt.hash("password123", 12),
        fullName: "Dr. Alan Grant",
        role: "faculty",
        department: cseDept._id,
        profilePhoto: "/diverse-professor-lecturing.png",
      },
      {
        employeeId: "FAC003",
        email: "mrs.davis@university.edu",
        password: await bcrypt.hash("password123", 12),
        fullName: "Mrs. Davis",
        role: "class_incharge",
        department: cseDept._id,
      },
      {
        employeeId: "HOD001",
        email: "hod.cse@university.edu",
        password: await bcrypt.hash("password123", 12),
        fullName: "Dr. Sarah Johnson",
        role: "hod",
        department: cseDept._id,
      },
      {
        employeeId: "PRIN001",
        email: "principal@university.edu",
        password: await bcrypt.hash("password123", 12),
        fullName: "Principal Sarah Johnson",
        role: "principal",
        department: cseDept._id,
      },
    ])

    const profDavis = users.find((u) => u.employeeId === "FAC001")
    const drGrant = users.find((u) => u.employeeId === "FAC002")
    const mrsDavis = users.find((u) => u.employeeId === "FAC003")
    const hodCSE = users.find((u) => u.employeeId === "HOD001")

    // Update department HODs
    await Department.findByIdAndUpdate(cseDept._id, { hod: hodCSE._id })

    // Create Sections
    console.log("📚 Creating sections...")
    const sections = await Section.insertMany([
      {
        name: "CSE Section A",
        code: "CSE-A",
        department: cseDept._id,
        year: 3,
        semester: 5,
        classIncharge: mrsDavis._id,
        maxStudents: 60,
        currentStrength: 45,
        academicYear: "2023-2024",
        classroom: "Room 301",
      },
      {
        name: "CSE Section B",
        code: "CSE-B",
        department: cseDept._id,
        year: 3,
        semester: 5,
        classIncharge: mrsDavis._id,
        maxStudents: 60,
        currentStrength: 45,
        academicYear: "2023-2024",
        classroom: "Room 302",
      },
      {
        name: "IT Section A",
        code: "IT-A",
        department: itDept._id,
        year: 3,
        semester: 5,
        maxStudents: 50,
        currentStrength: 40,
        academicYear: "2023-2024",
        classroom: "Room 201",
      },
    ])

    const cseSectionA = sections.find((s) => s.code === "CSE-A")
    const cseSectionB = sections.find((s) => s.code === "CSE-B")
    const itSectionA = sections.find((s) => s.code === "IT-A")

    // Create Subjects
    console.log("📖 Creating subjects...")
    const subjects = await Subject.insertMany([
      {
        name: "Data Structures",
        code: "CS301",
        department: cseDept._id,
        credits: 4,
        type: "theory",
        semester: 5,
        year: 3,
        description: "Fundamental data structures and algorithms",
        hoursPerWeek: { theory: 3, practical: 2, tutorial: 1 },
      },
      {
        name: "Operating Systems",
        code: "CS302",
        department: cseDept._id,
        credits: 4,
        type: "theory",
        semester: 5,
        year: 3,
        description: "Operating system concepts and implementation",
        hoursPerWeek: { theory: 3, practical: 2, tutorial: 1 },
      },
      {
        name: "Intro to Programming",
        code: "CS101",
        department: cseDept._id,
        credits: 3,
        type: "theory",
        semester: 1,
        year: 1,
        description: "Introduction to programming concepts",
        hoursPerWeek: { theory: 2, practical: 3, tutorial: 1 },
      },
      {
        name: "Computer Networks",
        code: "IT301",
        department: itDept._id,
        credits: 4,
        type: "theory",
        semester: 5,
        year: 3,
        description: "Network protocols and architecture",
        hoursPerWeek: { theory: 3, practical: 2, tutorial: 1 },
      },
    ])

    const dataStructures = subjects.find((s) => s.code === "CS301")
    const operatingSystems = subjects.find((s) => s.code === "CS302")
    const introProgramming = subjects.find((s) => s.code === "CS101")
    const computerNetworks = subjects.find((s) => s.code === "IT301")

    // Create Subject Assignments
    console.log("📋 Creating subject assignments...")
    await SubjectAssignment.insertMany([
      {
        subject: dataStructures._id,
        faculty: profDavis._id,
        section: cseSectionB._id,
        academicYear: "2023-2024",
        assignmentType: "primary",
        startDate: new Date("2023-08-01"),
      },
      {
        subject: operatingSystems._id,
        faculty: drGrant._id,
        section: itSectionA._id,
        academicYear: "2023-2024",
        assignmentType: "primary",
        startDate: new Date("2023-08-01"),
      },
      {
        subject: introProgramming._id,
        faculty: profDavis._id,
        section: cseSectionA._id,
        academicYear: "2023-2024",
        assignmentType: "primary",
        startDate: new Date("2023-08-01"),
      },
    ])

    // Create Students
    console.log("🎓 Creating students...")
    const students = []
    const studentNames = [
      "Alice Johnson",
      "Bob Williams",
      "Charlie Brown",
      "Diana Miller",
      "Ethan Davis",
      "Fiona Garcia",
      "George Harris",
      "Hannah Wilson",
      "Ian Martinez",
      "Julia Anderson",
      "Kevin Taylor",
      "Luna Rodriguez",
      "Michael Thompson",
      "Nina White",
      "Oscar Lopez",
      "Olivia Chen",
      "Liam Rodriguez",
      "Sophia Patel",
      "Noah Kim",
      "Emma Hayes",
      "Jackson Reed",
      "Noah Carter",
      "Olivia Bennett",
    ]

    // Create students for CSE-B section
    for (let i = 0; i < 23; i++) {
      students.push({
        rollNumber: `CSE200${(i + 1).toString().padStart(2, "0")}`,
        name: studentNames[i] || `Student ${i + 1}`,
        email: `cse200${(i + 1).toString().padStart(2, "0")}@university.edu`,
        section: cseSectionB._id,
        department: cseDept._id,
        year: 3,
        semester: 5,
        profilePhoto: i < 5 ? `/student-${i + 1}.png` : null,
        contactNumber: `+1-555-${(1000 + i).toString()}`,
        admissionDate: new Date("2021-08-01"),
      })
    }

    // Create students for CSE-A section
    for (let i = 0; i < 15; i++) {
      students.push({
        rollNumber: `CSE210${(i + 1).toString().padStart(2, "0")}`,
        name: `CSE-A Student ${i + 1}`,
        email: `cse210${(i + 1).toString().padStart(2, "0")}@university.edu`,
        section: cseSectionA._id,
        department: cseDept._id,
        year: 3,
        semester: 5,
        contactNumber: `+1-555-${(2000 + i).toString()}`,
        admissionDate: new Date("2021-08-01"),
      })
    }

    await Student.insertMany(students)

    // Create Holidays
    console.log("🎉 Creating holidays...")
    await Holiday.insertMany([
      {
        name: "Independence Day",
        date: new Date("2023-07-04"),
        type: "national",
        description: "National Independence Day",
        academicYear: "2023-2024",
        isRecurring: true,
      },
      {
        name: "Thanksgiving",
        date: new Date("2023-11-23"),
        type: "national",
        description: "Thanksgiving Day",
        academicYear: "2023-2024",
        isRecurring: true,
      },
      {
        name: "Winter Break",
        date: new Date("2023-12-20"),
        type: "institutional",
        description: "Winter vacation begins",
        academicYear: "2023-2024",
      },
      {
        name: "Mid-term Exams",
        date: new Date("2023-10-15"),
        type: "exam",
        description: "Mid-semester examinations",
        academicYear: "2023-2024",
      },
    ])

    console.log("✅ Database initialization completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`- Departments: ${departments.length}`)
    console.log(`- Users (Faculty): ${users.length}`)
    console.log(`- Sections: ${sections.length}`)
    console.log(`- Subjects: ${subjects.length}`)
    console.log(`- Students: ${students.length}`)
    console.log(`- Holidays: 4`)

    console.log("\n🔐 Default Login Credentials:")
    console.log("Faculty: professor.davis@university.edu / password123")
    console.log("Faculty: dr.grant@university.edu / password123")
    console.log("Class Incharge: mrs.davis@university.edu / password123")
    console.log("HOD: hod.cse@university.edu / password123")
    console.log("Principal: principal@university.edu / password123")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("👋 Disconnected from MongoDB")
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase()
}

module.exports = initializeDatabase
