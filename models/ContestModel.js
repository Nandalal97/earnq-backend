// models/Contest.js
const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  entryFee: { type: Number, required: true },
  prizeAmount: { type: Number, required: true },
  duration: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  language: { type: String, default: 'en' },
  status: {
  type: String,
  enum: ['active', 'inActive'],
  default: 'active'
},
attemptOnce: { type: Boolean, default: true },
maxParticipants: { type: Number, default: 0 }  // 0 = unlimited

},
{timestamps:true});

module.exports = mongoose.model('Contest', ContestSchema);
