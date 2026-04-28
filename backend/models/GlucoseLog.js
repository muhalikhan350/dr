const mongoose = require('mongoose');

const glucoseLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true, min: 20, max: 600 },
  unit: { type: String, default: 'mg/dL' },
  type: { type: String, enum: ['fasting', 'post-meal', 'random', 'bedtime'], default: 'random' },
  loggedAt: { type: Date, default: Date.now },
  notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('GlucoseLog', glucoseLogSchema);

