const jwt = require("jsonwebtoken")
const User = require("../models/User")

module.exports = async (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token") || req.header("Authorization")?.replace("Bearer ", "")

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")

    // Check if user still exists and is active
    const user = await User.findById(decoded.user.id).select("-password")
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Token is not valid" })
    }

    req.user = decoded.user
    req.userDoc = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Token is not valid" })
  }
}
