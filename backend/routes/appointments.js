const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Patient: Book appointment
router.post('/', auth, [
  body('consultType').isIn(['clinic', 'online', 'home']).withMessage('Invalid consultation type'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('appointmentDate').notEmpty().withMessage('Date is required'),
  body('appointmentTime').notEmpty().withMessage('Time is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    // Find assigned doctor for this patient
    const patient = await Patient.findOne({ user: req.user._id });
    const doctorId = patient?.assignedDoctor;

    const appointment = new Appointment({
      patient: req.user._id,
      patientName: req.user.fullName,
      patientPhone: req.user.phone,
      patientCnic: req.user.cnic,
      doctor: doctorId,
      ...req.body
    });
    await appointment.save();
    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Patient: Get my appointments
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'fullName specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin/Doctor: Get all appointments
router.get('/all', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const { status, date, doctor } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctor) filter.doctor = doctor;
    if (date) {
      const d = new Date(date);
      filter.appointmentDate = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'fullName phone cnic patientId')
      .populate('doctor', 'fullName specialization')
      .sort({ appointmentDate: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin/Doctor: Update appointment status
router.patch('/:id/status', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const { status, notes, doctorNotes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, doctorNotes },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Patient: Cancel my appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      patient: req.user._id,
      status: 'pending'
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled' });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
