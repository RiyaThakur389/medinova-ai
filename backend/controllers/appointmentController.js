const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get all appointments (admin) / filtered (doctor/patient)
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, date } = req.query;
  let query = {};

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (doctor) query.doctor = doctor._id;
  } else if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    if (patient) query.patient = patient._id;
  }

  if (status) query.status = status;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.appointmentDate = { $gte: start, $lte: end };
  }

  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone avatar' } })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ appointmentDate: -1 });

  res.json({ success: true, total, pages: Math.ceil(total / limit), currentPage: parseInt(page), appointments });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate('prescription');

  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  res.json({ success: true, appointment });
});

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Patient
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, timeSlot, type, symptoms, notes } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

  // Check if slot is already booked
  const existing = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: new Date(appointmentDate),
    timeSlot,
    status: { $in: ['Pending', 'Approved'] }
  });

  if (existing) {
    return res.status(400).json({ success: false, message: 'This time slot is already booked' });
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctorId,
    appointmentDate: new Date(appointmentDate),
    timeSlot,
    type: type || 'Consultation',
    symptoms,
    notes,
    fee: doctor.consultationFee
  });

  // Add doctor to patient's assigned doctors if not already
  if (!patient.assignedDoctors.includes(doctorId)) {
    patient.assignedDoctors.push(doctorId);
    await patient.save();
  }

  const populated = await Appointment.findById(appointment._id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

  res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment: populated });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Doctor / Admin
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, doctorNotes, cancelReason } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  appointment.status = status;
  if (doctorNotes) appointment.doctorNotes = doctorNotes;
  if (cancelReason) appointment.cancelReason = cancelReason;
  if (status === 'Cancelled') appointment.cancelledBy = req.user.role;

  await appointment.save();

  const updated = await Appointment.findById(appointment._id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

  res.json({ success: true, message: `Appointment ${status.toLowerCase()}`, appointment: updated });
});

// @desc    Cancel appointment (patient can cancel their own)
// @route   PUT /api/appointments/:id/cancel
// @access  Patient / Admin
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient || appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
  }

  appointment.status = 'Cancelled';
  appointment.cancelledBy = req.user.role;
  appointment.cancelReason = req.body.reason || 'Cancelled by patient';
  await appointment.save();

  res.json({ success: true, message: 'Appointment cancelled', appointment });
});

// @desc    Get available time slots for a doctor on a date
// @route   GET /api/appointments/slots/:doctorId
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { doctorId } = req.params;

  if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

  const allSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status: { $in: ['Pending', 'Approved'] }
  });

  const bookedSlots = bookedAppointments.map(a => a.timeSlot);
  const available = allSlots.filter(slot => !bookedSlots.includes(slot));

  res.json({ success: true, allSlots, available, booked: bookedSlots });
});

module.exports = { getAppointments, getAppointment, bookAppointment, updateAppointmentStatus, cancelAppointment, getAvailableSlots };
