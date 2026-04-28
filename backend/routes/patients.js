const express = require('express');
const GlucoseLog = require('../models/GlucoseLog');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const LabTest = require('../models/LabTest');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const VideoSession = require('../models/VideoSession');
const auth = require('../middleware/auth');

const router = express.Router();

// Get patient dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('assignedDoctor', 'fullName specialization phone');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient record not found' });

    const [recentGlucose, upcomingAppointments, recentReports, recentLabTests, recentPrescriptions, recentMedicalRecords, upcomingVideoSessions, stats] = await Promise.all([
      GlucoseLog.find({ patient: req.user._id }).sort({ loggedAt: -1 }).limit(7),
      Appointment.find({
        patient: req.user._id,
        appointmentDate: { $gte: new Date(new Date().setHours(0,0,0,0)) },
        status: { $in: ['pending', 'confirmed'] }
      }).sort({ appointmentDate: 1 }).limit(5),
      Report.find({ patient: req.user._id }).sort({ createdAt: -1 }).limit(5),
      LabTest.find({ patient: patient._id, status: 'completed' }).sort({ completedAt: -1 }).limit(5),
      Prescription.find({ patient: patient._id }).sort({ createdAt: -1 }).limit(5),
      MedicalRecord.find({ patient: patient._id }).sort({ createdAt: -1 }).limit(5),
      VideoSession.find({ patient: patient._id, status: 'scheduled', scheduledAt: { $gte: new Date() } })
        .populate('doctor', 'fullName').sort({ scheduledAt: 1 }).limit(3),
      {
        totalAppointments: await Appointment.countDocuments({ patient: req.user._id }),
        totalReports: await Report.countDocuments({ patient: req.user._id }),
        totalGlucoseLogs: await GlucoseLog.countDocuments({ patient: req.user._id }),
        totalLabTests: await LabTest.countDocuments({ patient: patient._id }),
        totalPrescriptions: await Prescription.countDocuments({ patient: patient._id })
      }
    ]);

    res.json({
      success: true,
      user: req.user.toJSON(),
      patient,
      recentGlucose,
      upcomingAppointments,
      recentReports,
      recentLabTests,
      recentPrescriptions,
      recentMedicalRecords,
      upcomingVideoSessions,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my full medical history
router.get('/history', auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const [prescriptions, labTests, medicalRecords, appointments, glucoseLogs, videoSessions] = await Promise.all([
      Prescription.find({ patient: patient._id }).populate('doctor', 'fullName specialization').sort({ createdAt: -1 }),
      LabTest.find({ patient: patient._id }).populate('doctor', 'fullName').sort({ createdAt: -1 }),
      MedicalRecord.find({ patient: patient._id }).populate('doctor', 'fullName').sort({ createdAt: -1 }),
      Appointment.find({ patient: req.user._id }).sort({ createdAt: -1 }),
      GlucoseLog.find({ patient: req.user._id }).sort({ loggedAt: -1 }),
      VideoSession.find({ patient: patient._id }).populate('doctor', 'fullName').sort({ scheduledAt: -1 })
    ]);

    res.json({ success: true, prescriptions, labTests, medicalRecords, appointments, glucoseLogs, videoSessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Log glucose reading
router.post('/glucose', auth, async (req, res) => {
  try {
    const { value, type, notes } = req.body;
    const log = new GlucoseLog({
      patient: req.user._id,
      value,
      type: type || 'random',
      notes
    });
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get glucose history
router.get('/glucose', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const logs = await GlucoseLog.find({
      patient: req.user._id,
      loggedAt: { $gte: since }
    }).sort({ loggedAt: 1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update patient profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { height, weight, allergies, chronicConditions, currentMedications, emergencyContact } = req.body;
    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      { height, weight, allergies, chronicConditions, currentMedications, emergencyContact },
      { new: true }
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
