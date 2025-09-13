const mongoose = require("mongoose")

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    type: {
      type: String,
      enum: ["theory", "practical", "project", "seminar"],
      default: "theory",
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    description: {
      type: String,
      trim: true,
    },
    syllabus: {
      type: String,
      trim: true,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    hoursPerWeek: {
      theory: { type: Number, default: 0 },
      practical: { type: Number, default: 0 },
      tutorial: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
subjectSchema.index({ code: 1 })
subjectSchema.index({ department: 1, semester: 1, year: 1 })

module.exports = mongoose.model("Subject", subjectSchema)
