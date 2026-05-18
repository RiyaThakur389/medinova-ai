const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalPatients, totalDoctors, totalAppointments,
    pendingAppointments, completedAppointments,
    totalPrescriptions, recentAppointments
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'Pending' }),
    Appointment.countDocuments({ status: 'Completed' }),
    Prescription.countDocuments(),
    Appointment.find()
      .populate({ path: 'patient', populate: { path: 'user', select: 'name avatar' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  // Monthly appointment data for chart (last 6 months)
  const monthlyData = await getMonthlyAppointments();

  // Specialization distribution
  const specializationData = await Doctor.aggregate([
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Appointment status distribution
  const statusData = await Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions
    },
    recentAppointments,
    monthlyData,
    specializationData,
    statusData
  });
});

// Helper: Get monthly appointment counts for last 6 months
const getMonthlyAppointments = async () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    const count = await Appointment.countDocuments({ createdAt: { $gte: start, $lte: end } });
    months.push({
      month: start.toLocaleString('default', { month: 'short' }),
      year: start.getFullYear(),
      count
    });
  }
  return months;
};

// @desc    Get all patients (admin)
// @route   GET /api/admin/patients
// @access  Admin
const getAllPatients = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  let userQuery = { role: 'patient' };

  if (search) userQuery.name = { $regex: search, $options: 'i' };

  const users = await User.find(userQuery).select('_id');
  const userIds = users.map(u => u._id);

  const total = await Patient.countDocuments({ user: { $in: userIds } });
  const patients = await Patient.find({ user: { $in: userIds } })
    .populate('user', 'name email phone avatar isActive createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, total, pages: Math.ceil(total / limit), currentPage: parseInt(page), patients });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
});

// @desc    Get system reports
// @route   GET /api/admin/reports
// @access  Admin
const getReports = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayAppointments, thisWeekAppointments, thisMonthAppointments, topDoctors] = await Promise.all([
    Appointment.countDocuments({ createdAt: { $gte: today } }),
    Appointment.countDocuments({ createdAt: { $gte: new Date(today - 7 * 24 * 60 * 60 * 1000) } }),
    Appointment.countDocuments({ createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) } }),
    Doctor.aggregate([
      { $lookup: { from: 'appointments', localField: '_id', foreignField: 'doctor', as: 'appointments' } },
      { $addFields: { appointmentCount: { $size: '$appointments' } } },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
      { $unwind: '$userInfo' },
      { $project: { specialization: 1, appointmentCount: 1, 'userInfo.name': 1, 'userInfo.avatar': 1 } }
    ])
  ]);

  res.json({ success: true, reports: { todayAppointments, thisWeekAppointments, thisMonthAppointments }, topDoctors });
});

module.exports = { getDashboardStats, getAllPatients, toggleUserStatus, getReports };
