const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  specialization: { type: String, default: 'Diabetologist' },
  qualification: { type: String, default: 'FCPS Endocrinology' },
  licenseNumber: { type: String },
  experience: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  availableDays: [{ type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }],
  availableTimeStart: { type: String, default: '10:00' },
  availableTimeEnd: { type: String, default: '18:00' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
