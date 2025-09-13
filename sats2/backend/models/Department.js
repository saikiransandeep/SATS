const mongoose = require("mongoose")

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    establishedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    contactInfo: {
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      office: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
departmentSchema.index({ code: 1 })
departmentSchema.index({ name: 1 })

module.exports = mongoose.model("Department", departmentSchema)
