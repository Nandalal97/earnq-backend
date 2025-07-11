const JWT = require("jsonwebtoken");
const User = require("../models/User");

const verifyEmain=async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ msg: "No token provided" });

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.verified) return res.json({ msg: "Email already verified" });

    user.verified = true;
    await user.save();

    return res.json({ msg: "Email successfully verified", status:1 });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: "Verification link expired. Please request a new one.", status: 0});
    }
    return res.status(400).json({ msg: "Invalid or expired token" });
  }
};
module.exports = verifyEmain;
