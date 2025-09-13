const mongoose = require("mongoose")

const attendanceSessionSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // in minutes
      default: null,
    },
    sessionType: {
      type: String,
      enum: ["lecture", "lab", "tutorial", "seminar"],
      default: "lecture",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    totalStudents: {
      type: Number,
      required: true,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    odCount: {
      type: Number,
      default: 0,
    },
    unmarkedCount: {
      type: Number,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate attendance statistics before saving
attendanceSessionSchema.pre("save", function (next) {
  if (this.totalStudents > 0) {
    this.unmarkedCount = this.totalStudents - (this.presentCount + this.absentCount + this.odCount)
    this.attendancePercentage = Math.round((this.presentCount / this.totalStudents) * 100)
  }
  next()
})

// Index for efficient queries
attendanceSessionSchema.index({ subject: 1, section: 1, date: 1 })
attendanceSessionSchema.index({ faculty: 1, date: 1 })
attendanceSessionSchema.index({ status: 1, date: 1 })

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema)
