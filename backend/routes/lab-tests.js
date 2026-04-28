const express = require('express');
const multer = require('multer');
const path = require('path');
const LabTest = require('../models/LabTest');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/lab/'),
  filename: (req, file, cb) => cb(null, `lab-${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

router.get('/pending', auth, roleCheck('lab', 'admin'), async (req, res) => {
  try {
    const tests = await LabTest.find({ status: { $in: ['requested', 'sample_collected', 'in_progress'] } })
      .populate('patient', 'fullName uhid phone')
      .populate('doctor', 'fullName specialization')
      .sort({ requestedAt: 1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', auth, roleCheck('lab', 'admin', 'doctor'), async (req, res) => {
  try {
    const { status, patient } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patient) filter.patient = patient;
    const tests = await LabTest.find(filter)
      .populate('patient', 'fullName uhid phone')
      .populate('doctor', 'fullName specialization')
      .sort({ requestedAt: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', auth, roleCheck('lab', 'admin', 'doctor'), async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id)
      .populate('patient', 'fullName uhid phone dateOfBirth gender')
      .populate('doctor', 'fullName specialization');
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/results', auth, roleCheck('lab', 'admin'), async (req, res) => {
  try {
    const { tests, notes } = req.body;
    const test = await LabTest.findByIdAndUpdate(
      req.params.id,
      { tests, notes, status: 'completed', completedAt: new Date(), uploadedBy: req.user._id },
      { new: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/upload', auth, roleCheck('lab', 'admin'), upload.single('labReport'), async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(
      req.params.id,
      { fileUrl: `/uploads/lab/${req.file.filename}`, fileName: req.file.originalname, uploadedBy: req.user._id, uploadedAt: new Date() },
      { new: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', auth, roleCheck('lab', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'completed') update.completedAt = new Date();
    const test = await LabTest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
