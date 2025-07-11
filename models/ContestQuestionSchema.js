const mongoose = require('mongoose');

const ContestQuestionSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'contest',
    required: true,
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'bn', 'mr', 'ta', 'te', 'gu', 'kn', 'or', 'pa'],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (val) => val.length >= 2 && val.length <= 6,
      message: 'Options must be between 2 and 6',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (val) {
        return this.options && val >= 0 && val < this.options.length;
      },
      message: 'Correct answer index must match options array length',
    },
  }

}, { timestamps: true });

module.exports = mongoose.model('ContestQuestion', ContestQuestionSchema);
