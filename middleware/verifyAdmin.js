// middleware/verifyAdmin.js

const jwt = require('jsonwebtoken');
const Admin = require('../models/admin/AdminModel');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware: verifyToken
const verifyAdminToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-password');
    if (!admin) return res.status(401).json({ message: 'Admin not found' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware: checkRole
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Forbidden: Role not allowed' });
    }
    next();
  };
};

// ✅ FIXED EXPORT
module.exports = { verifyAdminToken, checkRole };
