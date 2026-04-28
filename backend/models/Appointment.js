const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientCnic: { type: String, required: true },
  consultType: { type: String, enum: ['clinic', 'online', 'home'], required: true },
  serviceType: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  symptoms: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String, trim: true },
  doctorNotes: { type: String, trim: true },
  prescription: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

