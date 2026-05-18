const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all patients
router.get('/', protect, authorize('admin', 'doctor'), asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  let query = {};
  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'patient' });
    query.user = { $in: users.map(u => u._id) };
  }
  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query)
    .populate('user', 'name email phone avatar isActive')
    .skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
  res.json({ success: true, total, pages: Math.ceil(total / limit), currentPage: parseInt(page), patients });
}));

// Get my patient profile
router.get('/me', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar')
    .populate({ path: 'assignedDoctors', populate: { path: 'user', select: 'name avatar' } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
  res.json({ success: true, patient });
}));

// Get single patient
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate({ path: 'assignedDoctors', populate: { path: 'user', select: 'name avatar' } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, patient });
}));

// Update patient profile
router.put('/me', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const { name, phone, avatar, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, height, weight } = req.body;
  if (name || phone || avatar) await User.findByIdAndUpdate(req.user._id, { name, phone, avatar });
  const patient = await Patient.findOneAndUpdate(
    { user: req.user._id },
    { dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, height, weight },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone avatar');
  res.json({ success: true, message: 'Profile updated', patient });
}));

// Update patient by ID (admin)
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('user', 'name email phone avatar');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, patient });
}));

module.exports = router;
