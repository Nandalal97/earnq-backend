const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
