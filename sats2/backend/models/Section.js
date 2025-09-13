const mongoose = require("mongoose")

const sectionSchema = new mongoose.Schema(
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
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    classIncharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    maxStudents: {
      type: Number,
      default: 60,
      min: 1,
    },
    currentStrength: {
      type: Number,
      default: 0,
      min: 0,
    },
    academicYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{4}$/,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    classroom: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique section per department, year, and academic year
sectionSchema.index({ department: 1, year: 1, code: 1, academicYear: 1 }, { unique: true })

// Index for efficient queries
sectionSchema.index({ department: 1, year: 1 })
sectionSchema.index({ classIncharge: 1 })

module.exports = mongoose.model("Section", sectionSchema)
