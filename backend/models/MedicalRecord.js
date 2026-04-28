const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  patientUhid: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  recordType: { type: String, enum: ['consultation', 'follow_up', 'emergency', 'routine_checkup'], default: 'consultation' },
  chiefComplaint: { type: String },
  historyOfIllness: { type: String },
  examinationFindings: { type: String },
  vitalSigns: {
    bloodPressure: { type: String },
    heartRate: { type: Number },
    temperature: { type: Number },
    respiratoryRate: { type: Number },
    oxygenSaturation: { type: Number }
  },
  diagnosis: { type: String, required: true },
  treatmentPlan: { type: String },
  notes: { type: String },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
