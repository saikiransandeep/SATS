const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")
require("dotenv").config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const attendanceRoutes = require("./routes/attendance")
const reportRoutes = require("./routes/reports")
const classRoutes = require("./routes/classes")

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart-attendance", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id)

  // Join room for specific class
  socket.on("join-class", (classId) => {
    socket.join(`class-${classId}`)
    console.log(`👥 User ${socket.id} joined class-${classId}`)
  })

  // Handle attendance updates
  socket.on("attendance-update", (data) => {
    socket.to(`class-${data.classId}`).emit("attendance-changed", data)
  })

  // Handle session status changes
  socket.on("session-status", (data) => {
    socket.to(`class-${data.classId}`).emit("session-status-changed", data)
  })

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id)
  })
})

// Make io accessible to routes
app.set("io", io)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/classes", classRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = { app, io }
