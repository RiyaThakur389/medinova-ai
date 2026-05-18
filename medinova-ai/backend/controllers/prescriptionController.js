const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { asyncHandler } = require('../middleware/errorMiddleware');
const PDFDocument = require('pdfkit');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Doctor
const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, diagnosis, medicines, labTests, instructions, followUpDate, vitals } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

  const prescription = await Prescription.create({
    appointment: appointmentId,
    patient: patientId,
    doctor: doctor._id,
    diagnosis,
    medicines,
    labTests,
    instructions,
    followUpDate,
    vitals
  });

  // Link prescription to appointment
  if (appointmentId) {
    await Appointment.findByIdAndUpdate(appointmentId, {
      prescription: prescription._id,
      status: 'Completed'
    });
  }

  const populated = await Prescription.findById(prescription._id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

  res.status(201).json({ success: true, message: 'Prescription created', prescription: populated });
});

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (doctor) query.doctor = doctor._id;
  } else if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    if (patient) query.patient = patient._id;
  }

  const prescriptions = await Prescription.find(query)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone avatar' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: prescriptions.length, prescriptions });
});

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

  res.json({ success: true, prescription });
});

// @desc    Generate PDF prescription
// @route   GET /api/prescriptions/:id/pdf
// @access  Private
const generatePrescriptionPDF = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fillColor('#1a56db').fontSize(24).text('MediNova AI', { align: 'center' });
  doc.fillColor('#374151').fontSize(12).text('Hospital Management System', { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1a56db');
  doc.moveDown(0.5);

  // Doctor Info
  doc.fillColor('#1a56db').fontSize(14).text('Prescription');
  doc.fillColor('#374151').fontSize(10);
  doc.text(`Dr. ${prescription.doctor?.user?.name || 'N/A'}`);
  doc.text(`Specialization: ${prescription.doctor?.specialization || 'N/A'}`);
  doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
  doc.moveDown(0.5);

  // Patient Info
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e5e7eb');
  doc.moveDown(0.5);
  doc.fillColor('#1a56db').fontSize(12).text('Patient Details');
  doc.fillColor('#374151').fontSize(10);
  doc.text(`Name: ${prescription.patient?.user?.name || 'N/A'}`);
  doc.text(`Email: ${prescription.patient?.user?.email || 'N/A'}`);
  doc.text(`Phone: ${prescription.patient?.user?.phone || 'N/A'}`);
  doc.moveDown(0.5);

  // Diagnosis
  doc.fillColor('#1a56db').fontSize(12).text('Diagnosis');
  doc.fillColor('#374151').fontSize(10).text(prescription.diagnosis);
  doc.moveDown(0.5);

  // Medicines
  doc.fillColor('#1a56db').fontSize(12).text('Prescribed Medicines');
  prescription.medicines.forEach((med, i) => {
    doc.fillColor('#374151').fontSize(10);
    doc.text(`${i + 1}. ${med.name} - ${med.dosage} | ${med.frequency} | ${med.duration}`);
    if (med.instructions) doc.text(`   Instructions: ${med.instructions}`, { indent: 20 });
  });
  doc.moveDown(0.5);

  // Instructions
  if (prescription.instructions) {
    doc.fillColor('#1a56db').fontSize(12).text('General Instructions');
    doc.fillColor('#374151').fontSize(10).text(prescription.instructions);
    doc.moveDown(0.5);
  }

  // Follow-up
  if (prescription.followUpDate) {
    doc.fillColor('#1a56db').fontSize(12).text('Follow-up Date');
    doc.fillColor('#374151').fontSize(10).text(new Date(prescription.followUpDate).toLocaleDateString());
  }

  // Footer
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e5e7eb');
  doc.fillColor('#9ca3af').fontSize(8).text('This prescription was generated by MediNova AI Hospital Management System', { align: 'center' });

  doc.end();
});

module.exports = { createPrescription, getPrescriptions, getPrescription, generatePrescriptionPDF };
