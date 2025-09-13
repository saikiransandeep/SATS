const mongoose = require("mongoose")

const odRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    eventName: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    affectedSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttendanceSession",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
odRequestSchema.index({ student: 1, status: 1 })
odRequestSchema.index({ requestedBy: 1, status: 1 })
odRequestSchema.index({ fromDate: 1, toDate: 1 })

module.exports = mongoose.model("ODRequest", odRequestSchema)
