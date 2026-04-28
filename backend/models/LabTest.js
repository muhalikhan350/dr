const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  patientUhid: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  tests: [{
    testName: { type: String, required: true },
    testCode: { type: String },
    normalRange: { type: String },
    resultValue: { type: String },
    resultUnit: { type: String },
    isAbnormal: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['requested','sample_collected','in_progress','completed','cancelled'], default: 'requested' },
  notes: { type: String },
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  fileUrl: { type: String },
  fileName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
