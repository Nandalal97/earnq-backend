const mongoose = require('mongoose');

const Questions = new mongoose.Schema({
  question_id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  correct_option: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  translations: {
    type: Map,
    of: new mongoose.Schema({
      question: String,
      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },
      explanation: String
    }, { _id: false })
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', Questions);
