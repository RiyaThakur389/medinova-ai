const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    maxlength: 500
  },
  medicines: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,      // e.g., "500mg"
    frequency: String,   // e.g., "Twice daily"
    duration: String,    // e.g., "7 days"
    instructions: String, // e.g., "Take after meals"
    quantity: Number
  }],
  labTests: [{
    name: String,
    urgency: { type: String, enum: ['Routine', 'Urgent', 'STAT'] },
    notes: String
  }],
  instructions: {
    type: String,
    maxlength: 1000
  },
  followUpDate: Date,
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    oxygenSaturation: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pdfUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
