const express = require('express');
const VideoSession = require('../models/VideoSession');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Admin: Create video session
router.post('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { patient, doctor, appointment, roomName, scheduledAt } = req.body;
    const session = new VideoSession({ patient, doctor, appointment, roomName, scheduledAt });
    await session.save();
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my video sessions (patient or doctor)
router.get('/my-sessions', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) query.doctor = doctor._id;
    }
    const sessions = await VideoSession.find(query).sort({ scheduledAt: 1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get session by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await VideoSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update session status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await VideoSession.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
