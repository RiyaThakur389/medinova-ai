/**
 * MediNova AI - Database Seeder
 * Run: npm run seed
 * This will populate the database with sample data for testing.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medinova_ai';

// ─── Sample Data ──────────────────────────────────────────────────────────────

const usersData = [
  // Admin
  { name: 'Admin User', email: 'admin@hospital.com', password: 'password123', role: 'admin', phone: '+91-9000000001' },

  // Doctors
  { name: 'Dr. Arjun Sharma', email: 'arjun.sharma@hospital.com', password: 'password123', role: 'doctor', phone: '+91-9000000002' },
  { name: 'Dr. Priya Mehta', email: 'priya.mehta@hospital.com', password: 'password123', role: 'doctor', phone: '+91-9000000003' },
  { name: 'Dr. Rahul Gupta', email: 'rahul.gupta@hospital.com', password: 'password123', role: 'doctor', phone: '+91-9000000004' },
  { name: 'Dr. Sneha Patel', email: 'sneha.patel@hospital.com', password: 'password123', role: 'doctor', phone: '+91-9000000005' },
  { name: 'Dr. Vikram Singh', email: 'vikram.singh@hospital.com', password: 'password123', role: 'doctor', phone: '+91-9000000006' },

  // Patients
  { name: 'Amit Kumar', email: 'amit.kumar@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000007' },
  { name: 'Sunita Devi', email: 'sunita.devi@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000008' },
  { name: 'Rohit Verma', email: 'rohit.verma@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000009' },
  { name: 'Kavita Joshi', email: 'kavita.joshi@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000010' },
  { name: 'Manoj Tiwari', email: 'manoj.tiwari@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000011' },
  { name: 'Pooja Sharma', email: 'pooja.sharma@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000012' },
  { name: 'Suresh Yadav', email: 'suresh.yadav@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000013' },
  { name: 'Anita Singh', email: 'anita.singh@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000014' },
  { name: 'Deepak Mishra', email: 'deepak.mishra@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000015' },
  { name: 'Rekha Pandey', email: 'rekha.pandey@gmail.com', password: 'password123', role: 'patient', phone: '+91-9000000016' },
];

const doctorsData = [
  {
    specialization: 'Cardiologist',
    licenseNumber: 'MCI-CARD-001',
    experience: 12,
    department: 'Cardiology',
    bio: 'Expert cardiologist with 12+ years treating heart diseases. Specializes in interventional cardiology.',
    consultationFee: 800,
    qualifications: [
      { degree: 'MBBS', institution: 'AIIMS Delhi', year: 2005 },
      { degree: 'MD Cardiology', institution: 'PGI Chandigarh', year: 2010 }
    ]
  },
  {
    specialization: 'Neurologist',
    licenseNumber: 'MCI-NEURO-002',
    experience: 9,
    department: 'Neurology',
    bio: 'Neurologist specializing in stroke, epilepsy, and neurodegenerative disorders.',
    consultationFee: 900,
    qualifications: [
      { degree: 'MBBS', institution: 'KEM Mumbai', year: 2008 },
      { degree: 'DM Neurology', institution: 'NIMHANS Bangalore', year: 2013 }
    ]
  },
  {
    specialization: 'Dentist',
    licenseNumber: 'DCI-DENT-003',
    experience: 7,
    department: 'Dental',
    bio: 'Cosmetic and general dentist providing comprehensive dental care for all age groups.',
    consultationFee: 500,
    qualifications: [
      { degree: 'BDS', institution: 'Maulana Azad Dental College', year: 2010 },
      { degree: 'MDS Orthodontics', institution: 'MAIDS Delhi', year: 2014 }
    ]
  },
  {
    specialization: 'Dermatologist',
    licenseNumber: 'MCI-DERM-004',
    experience: 8,
    department: 'Dermatology',
    bio: 'Dermatologist specializing in acne, psoriasis, skin cancer, and aesthetic dermatology.',
    consultationFee: 700,
    qualifications: [
      { degree: 'MBBS', institution: 'Grant Medical College Mumbai', year: 2009 },
      { degree: 'MD Dermatology', institution: 'AIIMS New Delhi', year: 2014 }
    ]
  },
  {
    specialization: 'Orthopedist',
    licenseNumber: 'MCI-ORTHO-005',
    experience: 15,
    department: 'Orthopedics',
    bio: 'Senior orthopedic surgeon with expertise in joint replacement, sports injuries, and spine surgery.',
    consultationFee: 1000,
    qualifications: [
      { degree: 'MBBS', institution: 'Lady Hardinge Medical College', year: 2002 },
      { degree: 'MS Orthopedics', institution: 'AIIMS Delhi', year: 2007 }
    ]
  }
];

const patientsData = [
  { dateOfBirth: new Date('1985-03-15'), gender: 'Male', bloodGroup: 'O+', height: 175, weight: 78, allergies: ['Penicillin'], address: { city: 'Delhi', state: 'Delhi', country: 'India' } },
  { dateOfBirth: new Date('1990-07-22'), gender: 'Female', bloodGroup: 'A+', height: 160, weight: 55, allergies: [], address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' } },
  { dateOfBirth: new Date('1978-11-05'), gender: 'Male', bloodGroup: 'B+', height: 168, weight: 82, allergies: ['Sulfa drugs'], address: { city: 'Bangalore', state: 'Karnataka', country: 'India' } },
  { dateOfBirth: new Date('1995-01-30'), gender: 'Female', bloodGroup: 'AB+', height: 158, weight: 52, allergies: [], address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' } },
  { dateOfBirth: new Date('1970-09-12'), gender: 'Male', bloodGroup: 'A-', height: 172, weight: 90, allergies: ['Aspirin'], address: { city: 'Hyderabad', state: 'Telangana', country: 'India' } },
  { dateOfBirth: new Date('1988-04-18'), gender: 'Female', bloodGroup: 'O-', height: 162, weight: 60, allergies: [], address: { city: 'Pune', state: 'Maharashtra', country: 'India' } },
  { dateOfBirth: new Date('1965-12-25'), gender: 'Male', bloodGroup: 'B-', height: 170, weight: 85, allergies: [], address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' } },
  { dateOfBirth: new Date('1992-06-08'), gender: 'Female', bloodGroup: 'AB-', height: 155, weight: 50, allergies: ['Codeine'], address: { city: 'Kolkata', state: 'West Bengal', country: 'India' } },
  { dateOfBirth: new Date('1980-02-14'), gender: 'Male', bloodGroup: 'O+', height: 180, weight: 88, allergies: [], address: { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' } },
  { dateOfBirth: new Date('1998-08-20'), gender: 'Female', bloodGroup: 'A+', height: 163, weight: 57, allergies: [], address: { city: 'Chandigarh', state: 'Punjab', country: 'India' } },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Create Users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(usersData);
    console.log(`✅ Created ${createdUsers.length} users`);

    const adminUser = createdUsers[0];
    const doctorUsers = createdUsers.slice(1, 6);
    const patientUsers = createdUsers.slice(6);

    // Create Doctor profiles
    console.log('👨‍⚕️ Creating doctor profiles...');
    const availability = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
      day, startTime: '09:00', endTime: '17:00', isAvailable: true
    }));

    const createdDoctors = await Promise.all(
      doctorUsers.map((user, i) =>
        Doctor.create({ user: user._id, ...doctorsData[i], availability })
      )
    );
    console.log(`✅ Created ${createdDoctors.length} doctor profiles`);

    // Create Patient profiles
    console.log('🏥 Creating patient profiles...');
    const createdPatients = await Promise.all(
      patientUsers.map((user, i) =>
        Patient.create({ user: user._id, ...patientsData[i] })
      )
    );
    console.log(`✅ Created ${createdPatients.length} patient profiles`);

    // Create Appointments
    console.log('📅 Creating sample appointments...');
    const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];
    const statuses = ['Pending', 'Approved', 'Completed', 'Completed', 'Approved'];
    const types = ['Consultation', 'Follow-up', 'Check-up', 'Consultation', 'Follow-up'];

    const appointmentsData = [];
    for (let i = 0; i < 15; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i % 7) - 3); // Mix of past/future
      appointmentsData.push({
        patient: createdPatients[i % createdPatients.length]._id,
        doctor: createdDoctors[i % createdDoctors.length]._id,
        appointmentDate: futureDate,
        timeSlot: timeSlots[i % timeSlots.length],
        type: types[i % types.length],
        status: statuses[i % statuses.length],
        symptoms: ['Chest pain and shortness of breath', 'Severe headache and dizziness', 'Toothache and swollen gums', 'Skin rash and itching', 'Knee pain and swelling'][i % 5],
        fee: createdDoctors[i % createdDoctors.length].consultationFee
      });
    }

    const createdAppointments = await Appointment.create(appointmentsData);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    // Create Prescriptions for completed appointments
    console.log('💊 Creating sample prescriptions...');
    const completedAppointments = createdAppointments.filter(a => a.status === 'Completed');

    const prescriptionsData = completedAppointments.map((appt, i) => ({
      appointment: appt._id,
      patient: appt.patient,
      doctor: appt.doctor,
      diagnosis: ['Hypertension Stage 1', 'Migraine with aura', 'Dental caries', 'Atopic dermatitis', 'Osteoarthritis knee'][i % 5],
      medicines: [
        {
          name: ['Amlodipine', 'Sumatriptan', 'Amoxicillin', 'Cetirizine', 'Diclofenac'][i % 5],
          dosage: ['5mg', '50mg', '500mg', '10mg', '50mg'][i % 5],
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take after meals'
        },
        {
          name: ['Aspirin', 'Paracetamol', 'Ibuprofen', 'Hydrocortisone cream', 'Pantoprazole'][i % 5],
          dosage: ['75mg', '500mg', '400mg', '1% w/w', '40mg'][i % 5],
          frequency: 'Twice daily',
          duration: '15 days',
          instructions: 'As needed'
        }
      ],
      instructions: 'Rest adequately. Avoid stress. Stay hydrated. Follow up in 2 weeks.',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      vitals: { bloodPressure: '120/80', heartRate: 72, temperature: 98.6, weight: 70, oxygenSaturation: 98 }
    }));

    const createdPrescriptions = await Prescription.create(prescriptionsData);
    console.log(`✅ Created ${createdPrescriptions.length} prescriptions`);

    // Link prescriptions back to appointments
    for (let i = 0; i < completedAppointments.length; i++) {
      await Appointment.findByIdAndUpdate(completedAppointments[i]._id, {
        prescription: createdPrescriptions[i]._id
      });
    }

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('🔐 LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('ADMIN:');
    console.log('  Email:    admin@hospital.com');
    console.log('  Password: password123\n');
    console.log('DOCTOR (sample):');
    console.log('  Email:    arjun.sharma@hospital.com');
    console.log('  Password: password123\n');
    console.log('PATIENT (sample):');
    console.log('  Email:    amit.kumar@gmail.com');
    console.log('  Password: password123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
