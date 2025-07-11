// models/ContestSubmission.js
const mongoose = require('mongoose');
const { boolean } = require('zod/v4');

const ContestSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  totalAnswer: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  skipped: { type: Number, required: true },
  score: { type: Number, required: true },
  answers: { type: Object },
  timeTaken: { type: Number }, // In seconds, optional
  isWinner: { type: Boolean, default: false },
  rank: { type: Number },
  isSubmit: { type: Boolean,default:false},
  submittedAt: { type: Date, default: Date.now }
},{
    timestamps:true
});

module.exports = mongoose.model('ContestSubmission', ContestSubmissionSchema);
