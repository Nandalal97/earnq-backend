const Subject = require('../models/Subject');
const Category = require('../models/Category');

const createSubject = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({status:0, msg: "Subject name and categoryId are required" });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({status:0, msg: "Category not found" });
    }

    // Check if subject already exists in this category
    const existing = await Subject.findOne({ name, categoryId });
    if (existing) {
      return res.status(409).json({status:0, msg: "Subject already exists in this category" });
    }

    const subject = new Subject({
      name,
      categoryId,
      categoryName: category.name // Denormalized
    });

    const saved = await subject.save();
    res.status(201).json({status:1, msg:"Subject Added Successful"});

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getSubjectsGroupedByCategory = async (req, res) => {
  try {
    const grouped = await Subject.aggregate([
      {
        $group: {
          _id: {
            categoryId: "$categoryId",
            categoryName: "$categoryName"
          },
          subjects: {
            $push: {
              id: "$_id",
              name: "$name"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category_id: "$_id.categoryId",
          category: "$_id.categoryName",
          subjects: 1
        }
      }
    ]);

    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getAllSubjectsWithCategory = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('categoryId', 'name') // populate category name only
      .sort({ createdAt: -1 });

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Failed to get subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
};

module.exports = {
  createSubject,
  getSubjectsGroupedByCategory,
  getAllSubjectsWithCategory
};
