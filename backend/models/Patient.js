const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uhid: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  cnic: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true }
  },
  bloodType: { type: String },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{ type: String }],
  medicalHistory: { type: String, default: '' },
  height: { type: Number },
  weight: { type: Number },
  bmi: { type: Number },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-calculate age before saving
patientSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const diff = Date.now() - this.dateOfBirth.getTime();
    this.age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
  if (this.height && this.weight) {
    const hM = this.height / 100;
    this.bmi = parseFloat((this.weight / (hM * hM)).toFixed(1));
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);

