const mongoose = require("mongoose")

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "create_session",
        "update_attendance",
        "submit_session",
        "create_user",
        "update_user",
        "delete_user",
        "create_student",
        "update_student",
        "approve_od",
        "reject_od",
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetModel: {
      type: String,
      enum: ["User", "Student", "AttendanceSession", "AttendanceRecord", "ODRequest"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    oldValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    sessionId: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We're using custom timestamp field
  },
)

// Index for efficient queries
auditLogSchema.index({ performedBy: 1, timestamp: -1 })
auditLogSchema.index({ action: 1, timestamp: -1 })
auditLogSchema.index({ targetModel: 1, targetId: 1, timestamp: -1 })

// TTL index to automatically delete old logs after 2 years
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 })

module.exports = mongoose.model("AuditLog", auditLogSchema)
