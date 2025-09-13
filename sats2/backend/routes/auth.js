const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password, rememberMe } = req.body

      // Check if user exists
      const user = await User.findOne({ email, isActive: true }).populate("department")
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Create JWT token
      const payload = {
        user: {
          id: user._id,
          role: user.role,
          department: user.department._id,
        },
      }

      const tokenExpiry = rememberMe ? "30d" : "24h"
      const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: tokenExpiry,
      })

      res.json({
        token,
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          profilePhoto: user.profilePhoto,
          preferences: user.preferences,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("department").select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", auth, (req, res) => {
  // In a more sophisticated setup, you might maintain a blacklist of tokens
  res.json({ message: "Logged out successfully" })
})

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post(
  "/change-password",
  [auth, body("currentPassword").isLength({ min: 6 }), body("newPassword").isLength({ min: 6 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user.id)

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({ message: "Password updated successfully" })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
