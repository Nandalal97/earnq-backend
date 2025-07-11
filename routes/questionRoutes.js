const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { addQuestion, getSigleQuestion, getAllQuestions, getQuestionsByCategoryAndSubject, updateQuestion, getSingleQuestion } = require('../controllers/questionController');
const verifyToken = require('../middleware/verifyToken');
const { verifyAdminToken } = require('../middleware/verifyAdmin');

// POST: Add a question
router.post('/add-question', addQuestion);
// get one qustions 
router.post('/get-question', getSigleQuestion);

// get all qustions
router.get('/',verifyToken, getAllQuestions);

// single questions
router.get('/single/:question_id', getSingleQuestion)

// get question category and subject ways
router.get('/filter', verifyAdminToken, getQuestionsByCategoryAndSubject)

// update questions
router.patch('/update/:question_id', updateQuestion);



module.exports = router;
