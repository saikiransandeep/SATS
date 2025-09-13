const mongoose = require("mongoose")

const attendanceRecordSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "od", "unmarked"],
      default: "unmarked",
    },
    markedAt: {
      type: Date,
      default: null,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique attendance per student per session
attendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true })

// Index for efficient queries
attendanceRecordSchema.index({ student: 1, status: 1 })
attendanceRecordSchema.index({ session: 1, status: 1 })

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema)
