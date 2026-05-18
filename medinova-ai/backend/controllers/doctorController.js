const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { generateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
  const { specialization, search, page = 1, limit = 10 } = req.query;

  let query = {};
  if (specialization) query.specialization = specialization;

  // If search, match user names too
  let userIds = [];
  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'doctor' });
    userIds = users.map(u => u._id);
    query.$or = [
      { user: { $in: userIds } },
      { specialization: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Doctor.countDocuments(query);
  const doctors = await Doctor.find(query)
    .populate('user', 'name email phone avatar isActive')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: doctors.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    doctors
  });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email phone avatar');

  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  res.json({ success: true, doctor });
});

// @desc    Create doctor (Admin only)
// @route   POST /api/doctors
// @access  Admin
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone,
    specialization, licenseNumber, experience,
    department, bio, consultationFee, qualifications
  } = req.body;

  // Create user account for doctor
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name, email, password: password || 'Doctor@123', role: 'doctor', phone
  });

  const doctor = await Doctor.create({
    user: user._id,
    specialization,
    licenseNumber,
    experience: experience || 0,
    department,
    bio,
    consultationFee: consultationFee || 500,
    qualifications: qualifications || [],
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
    ]
  });

  const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone avatar');

  res.status(201).json({ success: true, message: 'Doctor created successfully', doctor: populatedDoctor });
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Admin / Doctor (own profile)
const updateDoctor = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  // Doctors can only update their own profile
  if (req.user.role === 'doctor') {
    const myDoctor = await Doctor.findOne({ user: req.user._id });
    if (!myDoctor || myDoctor._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
  }

  const { name, phone, avatar, specialization, experience, department, bio, consultationFee, availability } = req.body;

  // Update user fields
  if (name || phone || avatar) {
    await User.findByIdAndUpdate(doctor.user, { name, phone, avatar });
  }

  // Update doctor fields
  doctor = await Doctor.findByIdAndUpdate(req.params.id, {
    specialization, experience, department, bio, consultationFee, availability
  }, { new: true, runValidators: true }).populate('user', 'name email phone avatar');

  res.json({ success: true, message: 'Doctor updated successfully', doctor });
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Admin
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  // Deactivate user instead of deleting
  await User.findByIdAndUpdate(doctor.user, { isActive: false });
  await Doctor.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Doctor removed successfully' });
});

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Doctor / Admin
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = { doctor: req.params.id };
  if (status) query.status = status;

  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ appointmentDate: -1 });

  res.json({ success: true, total, appointments });
});

// @desc    Get doctor's patients
// @route   GET /api/doctors/:id/patients
// @access  Doctor / Admin
const getDoctorPatients = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate({
    path: 'patients',
    populate: { path: 'user', select: 'name email phone avatar' }
  });

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  res.json({ success: true, patients: doctor.patients });
});

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor, getDoctorAppointments, getDoctorPatients };
