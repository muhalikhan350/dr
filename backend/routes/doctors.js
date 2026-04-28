const express = require('express');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const LabTest = require('../models/LabTest');
const Appointment = require('../models/Appointment');
const VideoSession = require('../models/VideoSession');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Doctor: Get my profile
router.get('/me', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Get my assigned patients
router.get('/patients', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const patients = await Patient.find({ assignedDoctor: doctor._id })
      .populate('assignedDoctor', 'fullName specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Get patient detail
router.get('/patients/:id', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const patient = await Patient.findOne({ _id: req.params.id, assignedDoctor: doctor._id })
      .populate('assignedDoctor', 'fullName specialization');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found or not assigned to you' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Get patient full history
router.get('/patients/:id/history', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    const patientUserId = patient ? patient.user : req.params.id;
    const [prescriptions, labTests, medicalRecords, appointments, glucoseLogs] = await Promise.all([
      Prescription.find({ patient: req.params.id }).sort({ createdAt: -1 }),
      LabTest.find({ patient: req.params.id }).sort({ createdAt: -1 }),
      MedicalRecord.find({ patient: req.params.id }).sort({ createdAt: -1 }),
      Appointment.find({ patient: patientUserId }).sort({ createdAt: -1 }),
      require('../models/GlucoseLog').find({ patient: patientUserId }).sort({ loggedAt: -1 })
    ]);
    res.json({ success: true, prescriptions, labTests, medicalRecords, appointments, glucoseLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Create prescription
router.post('/prescriptions', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const { patient, diagnosis, medications, advice, followUpDate, appointment } = req.body;
    const pat = await Patient.findById(patient);
    if (!pat) return res.status(404).json({ success: false, message: 'Patient not found' });
    const prescription = new Prescription({
      patient, patientName: pat.fullName, patientUhid: pat.uhid,
      doctor: doctor._id, doctorName: doctor.fullName,
      diagnosis, medications, advice, followUpDate, appointment
    });
    await prescription.save();
    res.status(201).json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Create medical record
router.post('/medical-records', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const { patient, recordType, chiefComplaint, historyOfIllness, examinationFindings, vitalSigns, diagnosis, treatmentPlan, notes, appointment } = req.body;
    const pat = await Patient.findById(patient);
    if (!pat) return res.status(404).json({ success: false, message: 'Patient not found' });
    const record = new MedicalRecord({
      patient, patientName: pat.fullName, patientUhid: pat.uhid,
      doctor: doctor._id, doctorName: doctor.fullName,
      recordType, chiefComplaint, historyOfIllness, examinationFindings, vitalSigns, diagnosis, treatmentPlan, notes, appointment
    });
    await record.save();
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Request lab test
router.post('/lab-requests', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const { patient, tests, notes, appointment } = req.body;
    const pat = await Patient.findById(patient);
    if (!pat) return res.status(404).json({ success: false, message: 'Patient not found' });
    const labTest = new LabTest({
      patient, patientName: pat.fullName, patientUhid: pat.uhid,
      doctor: doctor._id, doctorName: doctor.fullName,
      tests, notes, appointment
    });
    await labTest.save();
    res.status(201).json({ success: true, labTest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Get my upcoming appointments
router.get('/my-appointments', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ doctor: doctor._id }).sort({ appointmentDate: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor: Get video sessions
router.get('/video-sessions', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const sessions = await VideoSession.find({ doctor: doctor._id }).sort({ scheduledAt: 1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
