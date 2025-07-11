const Category = require('../models/Category');

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Category name is required" });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const category = new Category({ name });
    const saved = await category.save();
    res.status(201).json({status:1, msg:"Category added Successful"});
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Fetch all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // sort A-Z
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories
};