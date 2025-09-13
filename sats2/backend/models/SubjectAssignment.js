const mongoose = require("mongoose")

const subjectAssignmentSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{4}$/,
    },
    assignmentType: {
      type: String,
      enum: ["primary", "substitute", "guest"],
      default: "primary",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique assignment per subject-section-academic year
subjectAssignmentSchema.index({ subject: 1, section: 1, academicYear: 1 }, { unique: true })

// Index for efficient queries
subjectAssignmentSchema.index({ faculty: 1, academicYear: 1 })
subjectAssignmentSchema.index({ section: 1, academicYear: 1 })

module.exports = mongoose.model("SubjectAssignment", subjectAssignmentSchema)
