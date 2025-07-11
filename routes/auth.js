// routes/auth.js

const express = require("express");
const router = express.Router();

const { register, login, resendVerificationEmail, logout, logoutAllDevices,  } = require("../controllers/authController");
const { validateUserRegistration, validateUserLogin } = require("../middleware/userValidation");
const verifyToken = require("../middleware/verifyToken");
const verifyEmain = require("../controllers/verifyEmailController");
const checkSignupAttempts = require("../middleware/checkSignupAttempts");


router.post("/register",checkSignupAttempts, validateUserRegistration, register);
router.post("/login", validateUserLogin, login);
router.get('/logout', logout);
router.get("/verify-email", verifyEmain);
router.post('/resend-verification', resendVerificationEmail);
router.post('/logout-all', logoutAllDevices);



// Example controller
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ msg: 'Welcome to your dashboard!', user: req.user });
});

module.exports = router;
