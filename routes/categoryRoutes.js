const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories } = require('../controllers/categoryController');


router.post('/add-category', createCategory);
router.get('/categories', getAllCategories);

module.exports = router;

