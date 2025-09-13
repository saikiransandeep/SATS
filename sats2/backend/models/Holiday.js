const mongoose = require("mongoose")

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["national", "regional", "institutional", "exam"],
      default: "institutional",
    },
    description: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    academicYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{4}$/,
    },
    affectedDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
holidaySchema.index({ date: 1, academicYear: 1 })
holidaySchema.index({ type: 1, academicYear: 1 })

module.exports = mongoose.model("Holiday", holidaySchema)
