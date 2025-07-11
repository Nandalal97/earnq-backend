const express = require('express');
const router = express.Router();
const { createSubject, getSubjectsGroupedByCategory, getAllSubjectsWithCategory } = require('../controllers/subjectController');

router.post('/add-subject', createSubject);
router.get('/', getSubjectsGroupedByCategory);
router.get('/all', getAllSubjectsWithCategory);

module.exports = router;