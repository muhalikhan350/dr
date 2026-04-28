const express = require('express');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const LabTest = require('../models/LabTest');
const Prescription = require('../models/Prescription');
const VideoSession = require('../models/VideoSession');
const MedicalRecord = require('../models/MedicalRecord');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Get full dashboard stats
router.get('/stats', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalLabTechs, totalAppointments, pendingAppointments, confirmedAppointments, completedAppointments, todayAppointments, totalReports, pendingLabTests, completedLabTests, totalPrescriptions, totalVideoSessions, upcomingVideoSessions] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'lab' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Report.countDocuments(),
      LabTest.countDocuments({ status: { $in: ['requested', 'sample_collected', 'in_progress'] } }),
      LabTest.countDocuments({ status: 'completed' }),
      Prescription.countDocuments(),
      VideoSession.countDocuments(),
      VideoSession.countDocuments({ status: 'scheduled', scheduledAt: { $gte: new Date() } })
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients, totalDoctors, totalLabTechs,
        totalAppointments, pendingAppointments, confirmedAppointments, completedAppointments, todayAppointments,
        totalReports, pendingLabTests, completedLabTests,
        totalPrescriptions,
        totalVideoSessions, upcomingVideoSessions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all patients (from Patient collection)
router.get('/patients', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { uhid: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } }
      ];
    }
    const patients = await Patient.find(filter)
      .populate('assignedDoctor', 'fullName specialization')
      .populate('user', 'patientId email lastLogin')
      .sort({ createdAt: -1 });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get patient details with full history
router.get('/patients/:id', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'fullName specialization phone')
      .populate('user', 'patientId email lastLogin healthProfile');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const [appointments, reports, labTests, prescriptions, medicalRecords, videoSessions, glucoseLogs] = await Promise.all([
      Appointment.find({ patient: patient.user._id }).sort({ createdAt: -1 }),
      Report.find({ patient: patient.user._id }).sort({ createdAt: -1 }),
      LabTest.find({ patient: patient._id }).sort({ createdAt: -1 }),
      Prescription.find({ patient: patient._id }).sort({ createdAt: -1 }),
      MedicalRecord.find({ patient: patient._id }).sort({ createdAt: -1 }),
      VideoSession.find({ patient: patient._id }).sort({ scheduledAt: -1 }),
      require('../models/GlucoseLog').find({ patient: patient.user._id }).sort({ logDate: -1 }).limit(50)
    ]);

    res.json({
      success: true,
      patient, appointments, reports, labTests, prescriptions, medicalRecords, videoSessions, glucoseLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all doctors
router.get('/doctors', auth, roleCheck('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .populate('user', 'phone email lastLogin isActive')
      .sort({ createdAt: -1 });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create doctor account (admin only)
router.post('/create-doctor', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { fullName, cnic, phone, dateOfBirth, address, password, email, specialization, qualification, licenseNumber, experience, consultationFee, availableDays, availableTimeStart, availableTimeEnd } = req.body;
    const existing = await User.findOne({ $or: [{ cnic }, { phone }] });
    if (existing) return res.status(400).json({ success: false, message: 'User with this CNIC or phone already exists' });

    const user = new User({
      fullName, cnic, phone, dateOfBirth, address, password, email,
      role: 'doctor'
    });
    await user.save();

    const doctor = new Doctor({
      user: user._id,
      fullName,
      phone,
      email,
      specialization: specialization || 'Diabetologist',
      qualification: qualification || 'MBBS',
      licenseNumber,
      experience: experience || 0,
      consultationFee: consultationFee || 0,
      availableDays: availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      availableTimeStart: availableTimeStart || '10:00',
      availableTimeEnd: availableTimeEnd || '18:00'
    });
    await doctor.save();

    res.status(201).json({ success: true, message: 'Doctor account created', doctor, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create lab technician account (admin only)
router.post('/create-lab-tech', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { fullName, cnic, phone, password, email, address } = req.body;
    const existing = await User.findOne({ $or: [{ cnic }, { phone }] });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

    const user = new User({
      fullName, cnic, phone, password, email, address,
      role: 'lab'
    });
    await user.save();

    res.status(201).json({ success: true, message: 'Lab technician account created', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Assign patient to doctor
router.patch('/patients/:id/assign-doctor', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { assignedDoctor: doctorId },
      { new: true }
    ).populate('assignedDoctor', 'fullName specialization');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all appointments with full details
router.get('/appointments', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status, date, doctor } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctor) filter.doctor = doctor;
    if (date) {
      const d = new Date(date);
      filter.appointmentDate = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lt: new Date(d.setHours(23, 59, 59, 999)) };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'fullName phone patientId')
      .sort({ appointmentDate: -1, appointmentTime: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all lab tests
router.get('/lab-tests', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const tests = await LabTest.find(filter)
      .populate('patient', 'fullName uhid')
      .populate('doctor', 'fullName')
      .sort({ requestedAt: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all prescriptions
router.get('/prescriptions', auth, roleCheck('admin'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({})
      .populate('patient', 'fullName uhid')
      .populate('doctor', 'fullName specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
