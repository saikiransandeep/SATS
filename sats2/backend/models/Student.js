const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
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
    profilePhoto: {
      type: String,
      default: null,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    parentContact: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
studentSchema.index({ rollNumber: 1 })
studentSchema.index({ section: 1, year: 1 })
studentSchema.index({ department: 1, year: 1, semester: 1 })

module.exports = mongoose.model("Student", studentSchema)
