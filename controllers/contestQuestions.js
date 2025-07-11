const Question = require('../models/ContestQuestionSchema');
const Contest = require('../models/ContestModel');

// Create a question
const createContestQuestion = async (req, res) => {
  try {
    const { contestId, language, questionText, options, correctAnswer } = req.body;

    // Validate required fields
    if (!contestId || !language || !questionText || !options || correctAnswer === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if Contest exists
    const groupExists = await Contest.findById(contestId);
    if (!groupExists) {
      return res.status(404).json({ error: 'Invalid Exam Group ID' });
    }

    // Create question
    const question = new Question({
        contestId,
      language,
      questionText,
      options,
      correctAnswer,
    });

    await question.save();
    res.status(201).json({ status: 1, msg: 'Question created successfully', data: question });

  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all questions by contestId and optional language
const getContestQuestions = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { language } = req.query;

    const filter = { contestId };
    if (language) filter.language = language;

    const questions = await Question.find(filter);
    res.status(200).json({ status: 1, msg: 'Questions fetched', data: questions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const editContestQuestion = async (req, res) => {
  try {
    const { questionid } = req.params;
    const { questionText, options, correctAnswer, language, contestId } = req.body;

    // Validate required fields
    if (!questionText || !Array.isArray(options) || options.length !== 4 || correctAnswer === undefined) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Find and update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionid,
      {
        questionText,
        options,
        correctAnswer,
        language,
        contestId
      },
      { new: true } // return updated document
    );

    if (!updatedQuestion) {
      return res.status(404).json({ msg: "Question not found" });
    }

    res.json({ msg: "Question updated successfully", data: updatedQuestion });
  } catch (error) {
    console.error("Error editing question:", error);
    res.status(500).json({ msg: "Server error while updating question" });
  }
};

const deleteContestQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ msg: "Question not found." });
    }

    res.status(200).json({ msg: "Question deleted successfully." });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ msg: "Server error. Unable to delete question." });
  }
};

module.exports={createContestQuestion,editContestQuestion,deleteContestQuestion, getContestQuestions}