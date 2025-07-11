const Question = require('../models/Question');

// POST: Add a question
const addQuestion= async (req, res) => {
  try {
    let { question_id, category, subject } = req.body;

    if (!category || !subject) {
      return res.status(400).json({ msg: 'category and subject are required', status:0 });
    }

    // Create prefix like 'am' from category/subject
    const depInitial = category.trim().toLowerCase()[0];
    const catInitial = subject.trim().toLowerCase()[0];
    const prefix = depInitial + catInitial;

    // Check if provided question_id already exists
    const idExists = question_id
      ? await Question.findOne({ question_id })
      : true;

    // If no ID or ID exists, generate a new one using the prefix
    if (!question_id || idExists) {
      const last = await Question.findOne({
        question_id: { $regex: `^${prefix}_q\\d+$` }
      }).sort({ question_id: -1 });

      const lastNum = last
        ? parseInt(last.question_id.split('_q')[1]) || 0
        : 0;

      const nextNum = lastNum + 1;
      question_id = `${prefix}_q${nextNum.toString().padStart(3, '0')}`;
    }

    // Save the question
    const question = new Question({
      ...req.body,
      question_id,
      category,
      subject
    });

    await question.save();
    res.status(201).json({status:1, msg: 'Question added successfully', question_id });

  } catch (err) {
    res.status(500).json({status:0, error: err.message });
  }
};

// get one qustions 
const getSigleQuestion= async (req, res) => {
  const { question_id, language } = req.body;

  try {
    const question = await Question.findOne({ question_id });

    if (!question) {
      return res.status(404).json({ msg: 'Question not found', status: 0 });
    }

    const translated = question.translations.get(language) || question.translations.get('en');

    if (!translated) {
      return res.status(400).json({ msg: 'Translation not available', status: 0 });
    }

    res.json({
      question_id: question.question_id,
      correct_option: question.correct_option,
      question: translated.question,
      options: translated.options,
      explanation: translated.explanation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all questions, with optional random fetch
const getAllQuestions = async (req, res) => {
  try {
    const { category, subject, page = 1, limit = 10, random } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (subject) filter.subject = subject;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    if (random === 'true') {
      // Use MongoDB aggregation to fetch random questions with filter
      const questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: parsedLimit } }
      ]);

      return res.status(200).json({
        questions,
        totalQuestions: questions.length,
        totalPages: 1,
        currentPage: 1
      });
    }

    // Standard paginated fetch
    const skip = (parsedPage - 1) * parsedLimit;
    const totalQuestions = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(parsedLimit);

    res.status(200).json({
      questions,
      totalQuestions,
      totalPages: Math.ceil(totalQuestions / parsedLimit),
      currentPage: parsedPage
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// get question category and subject ways

const getQuestionsByCategoryAndSubject = async (req, res) => {
  try {
    const { category, subject, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (subject) filter.subject = subject;

    const totalQuestions = await Question.countDocuments(filter);
    const totalPages = Math.ceil(totalQuestions / limit);

    const questions = await Question.find(filter)
      .sort({ _id: -1 }) // newest first
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select("question_id category subject correct_option translations createdAt");

    res.status(200).json({
      questions,
      totalQuestions,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



//Update a question by question_id

const updateQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const updateData = req.body;

    const updated = await Question.findOneAndUpdate(
      { question_id },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Question not found', status: 0 });
    }

    res.json({ msg: 'Question updated successfully', status: 1, question: updated });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


// GET a single question by question_id
const getSingleQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;

    const question = await Question.findOne({ question_id });

    if (!question) {
      return res.status(404).json({ msg: 'Question not found', status: 0 });
    }

    res.status(200).json({
      status: 1,
      question_id: question.question_id,
      category: question.category,
      subject: question.subject,
      correct_option: question.correct_option,
      translations: Object.fromEntries(question.translations) // Convert Map to plain object
    });
  } catch (err) {
    res.status(500).json({ status: 0, msg: 'Server error', error: err.message });
  }
};





module.exports = {
  addQuestion,
  getSigleQuestion,
  getAllQuestions,
  getQuestionsByCategoryAndSubject,
  updateQuestion,
  getSingleQuestion 
};