const Admin = require('../../models/admin/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Register (Superadmin only)
const registerAdmin = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Admin already exists' });
    const existsNumber= await Admin.findOne({ phone });
    if (existsNumber) return res.status(400).json({status:0, msg: 'Admin Number already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ name, email, phone, password: hashed, role });
    await newAdmin.save();

    res.status(201).json({ status:1, msg: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({status:0, msg: 'Error creating admin' });
  }
};


// Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ status:0, msg: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({status:0, msg: 'Invalid credentials' });

    const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
        status:1,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email,phone: admin.phone, role: admin.role },
      msg:'Login successful'
      
    });
    
  } catch {
    res.status(500).json({ message: 'Login error' });
  }
};


module.exports={registerAdmin, loginAdmin }
