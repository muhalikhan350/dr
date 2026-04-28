const mongoose = require('mongoose');

const videoSessionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  status: { type: String, enum: ['scheduled','ongoing','completed','cancelled','missed'], default: 'scheduled' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  participantJoinTimes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    joinedAt: Date,
    leftAt: Date
  }],
  notes: { type: String },
  recordingUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('VideoSession', videoSessionSchema);
