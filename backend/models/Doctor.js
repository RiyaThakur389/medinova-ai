const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: ['Cardiologist', 'Neurologist', 'Dentist', 'Orthopedist', 'Dermatologist',
           'Pediatrician', 'Gynecologist', 'Ophthalmologist', 'Psychiatrist', 
           'General Physician', 'ENT Specialist', 'Urologist', 'Oncologist']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // years
    default: 0
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  consultationFee: {
    type: Number,
    default: 500
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,  // "09:00"
    endTime: String,    // "17:00"
    isAvailable: { type: Boolean, default: true }
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total appointments
doctorSchema.virtual('totalAppointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
  count: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
