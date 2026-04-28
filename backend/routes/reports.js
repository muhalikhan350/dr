const express = require('express');
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'backend/uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Admin/Doctor: Upload report
router.post('/upload', auth, roleCheck('admin', 'doctor'), upload.single('reportFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { patientId, reportType, reportTitle, description, testDate } = req.body;
    const User = require('../models/User');
    const patient = await User.findOne({ patientId });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const report = new Report({
      patient: patient._id,
      patientName: patient.fullName,
      patientId,
      reportType,
      reportTitle,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      testDate: testDate || new Date(),
      uploadedBy: req.user._id
    });

    await report.save();
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Patient: Get my reports
router.get('/my', auth, async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin/Doctor: Get all reports (with patient filter)
router.get('/all', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const reports = await Report.find(filter).populate('patient', 'fullName phone patientId').sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single report (patient can only access own, admin/doctor any)
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    if (req.user.role === 'patient' && report.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin/Doctor: Delete report
router.delete('/:id', auth, roleCheck('admin', 'doctor'), async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', path.basename(report.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

