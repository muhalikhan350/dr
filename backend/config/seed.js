require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_care');
    console.log('Connected to MongoDB');

    // Clear existing seeded users
    await User.deleteMany({ phone: { $in: ['00000000000', '11111111111', '22222222222'] } });
    await Doctor.deleteMany({ phone: '11111111111' });
    await Patient.deleteMany({ phone: '22222222222' });

    // Create Admin
    const adminUser = new User({
      fullName: 'System Administrator',
      cnic: '00000-0000000-0',
      phone: '00000000000',
      password: 'admin123',
      role: 'admin',
      address: 'Clinic Admin Office'
    });
    await adminUser.save();
    console.log('Admin created: phone=00000000000, password=admin123');

    // Create Doctor
    const doctorUser = new User({
      fullName: 'Dr. Muhammad Asif',
      cnic: '11111-1111111-1',
      phone: '11111111111',
      password: 'doctor123',
      role: 'doctor',
      address: 'Diabetes Care Clinic, Main Road'
    });
    await doctorUser.save();

    const doctor = new Doctor({
      user: doctorUser._id,
      fullName: 'Dr. Muhammad Asif',
      phone: '11111111111',
      email: 'dr.asif@diabetescare.pk',
      specialization: 'Diabetologist & Endocrinologist',
      qualification: 'FCPS Endocrinology, MBBS',
      licenseNumber: 'PMC-12345-DC',
      experience: 15,
      consultationFee: 2000,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      availableTimeStart: '10:00',
      availableTimeEnd: '18:00'
    });
    await doctor.save();
    console.log('Doctor created: phone=11111111111, password=doctor123');

    // Create Lab Technician
    const labUser = new User({
      fullName: 'Lab Technician',
      cnic: '33333-3333333-3',
      phone: '33333333333',
      password: 'lab123',
      role: 'lab',
      address: 'Clinic Laboratory'
    });
    await labUser.save();
    console.log('Lab Technician created: phone=33333333333, password=lab123');

    // Create a sample patient
    const patientUser = new User({
      fullName: 'Ahmad Khan',
      cnic: '22222-2222222-2',
      phone: '22222222222',
      password: 'patient123',
      role: 'patient',
      patientId: 'DC-10001',
      dateOfBirth: '1985-05-15',
      address: 'House 123, Street 4, Lahore'
    });
    await patientUser.save();

    const patient = new Patient({
      user: patientUser._id,
      uhid: 'UHID-100001',
      fullName: 'Ahmad Khan',
      cnic: '22222-2222222-2',
      phone: '22222222222',
      dateOfBirth: new Date('1985-05-15'),
      age: 39,
      gender: 'male',
      address: 'House 123, Street 4, Lahore',
      assignedDoctor: doctor._id,
      bloodType: 'O+',
      allergies: ['Penicillin'],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
      emergencyContact: { name: 'Fatima Khan', phone: '03001234567', relation: 'Wife' }
    });
    await patient.save();
    console.log('Patient created: phone=22222222222, password=patient123');

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
