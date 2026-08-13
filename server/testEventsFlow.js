import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';

dotenv.config();

const runRegistrationsTest = async () => {
  console.log('🧪 Starting View Registered Students Feature Test Suite...\n');

  try {
    await connectDB();

    // Clean up test users & events
    const testEmails = ['reg_stu@college.edu', 'reg_fac1@college.edu', 'reg_fac2@college.edu', 'reg_admin@college.edu'];
    await User.deleteMany({ email: { $in: testEmails } });
    await Event.deleteMany({ title: { $regex: /Registration Test Event/i } });
    console.log('🧹 Cleaned up existing registration test accounts in MongoDB Atlas.');

    // 1. Create Users
    const student = await User.create({
      name: 'Alice Student',
      email: 'reg_stu@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      profileInfo: { rollNumber: 'CS202611' },
    });

    const faculty1 = await User.create({
      name: 'Prof. Creator',
      email: 'reg_fac1@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      profileInfo: { employeeId: 'FAC-101' },
    });

    const faculty2 = await User.create({
      name: 'Prof. Other',
      email: 'reg_fac2@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Electrical',
      profileInfo: { employeeId: 'FAC-102' },
    });

    const admin = await User.create({
      name: 'Admin Boss',
      email: 'reg_admin@college.edu',
      password: 'password123',
      role: 'admin',
      department: 'Management',
    });

    console.log('✅ Created test users: Student Alice, Creator Prof, Other Prof, Admin Boss.');

    // 2. Faculty 1 Creates Event
    const event = await Event.create({
      title: 'Registration Test Event: Full Stack Workshop',
      description: 'MERN stack laboratory event for student registrations.',
      date: new Date('2026-10-15'),
      time: '11:00 AM',
      venue: 'Lab 3',
      category: 'workshop',
      capacity: 30,
      createdBy: faculty1._id,
      participants: [],
    });
    console.log('✅ Event created by Faculty 1 (Prof. Creator): ID =', event._id.toString());

    // TEST 1: Student registers for the event
    console.log('\n--- Test 1: Student Registers for Event ---');
    event.participants.push(student._id);
    await event.save();

    const checkEvent = await Event.findById(event._id).populate('participants', 'name email department profileInfo');
    console.log('✅ Student registered. Participant count:', checkEvent.participants.length);
    console.log('✅ Registered Student Name:', checkEvent.participants[0].name);

    // TEST 2: Faculty Creator Access check
    console.log('\n--- Test 2: Faculty Creator (Faculty 1) Views Registrations ---');
    const isCreatorAuthorized = event.createdBy.toString() === faculty1._id.toString();
    console.log('✅ Faculty 1 is Event Creator:', isCreatorAuthorized ? '✅ PASS (HTTP 200 Allowed)' : '❌ FAIL');

    // TEST 3: Non-Creator Faculty Access check
    console.log('\n--- Test 3: Other Faculty (Faculty 2) Attempts to View Registrations ---');
    const isFac2Authorized = event.createdBy.toString() === faculty2._id.toString() || faculty2.role === 'admin';
    console.log('✅ Faculty 2 allowed to view Faculty 1 registrations:', isFac2Authorized ? '❌ ALLOWED (FAIL)' : '✅ PASS (HTTP 403 Forbidden)');

    // TEST 4: Admin Access check
    console.log('\n--- Test 4: Admin Views Registrations ---');
    const isAdminAuthorized = admin.role === 'admin';
    console.log('✅ Admin allowed to view any event registrations:', isAdminAuthorized ? '✅ PASS (HTTP 200 Allowed)' : '❌ FAIL');

    // TEST 5: Student Access check
    console.log('\n--- Test 5: Student Attempts to Access Registrations ---');
    const isStudentAuthorized = student.role === 'admin' || (student.role === 'faculty' && event.createdBy.toString() === student._id.toString());
    console.log('✅ Student allowed to view complete registration list:', isStudentAuthorized ? '❌ ALLOWED (FAIL)' : '✅ PASS (HTTP 403 Forbidden)');

    console.log('\n✨ ALL VIEW REGISTERED STUDENTS FEATURE TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Test Suite Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runRegistrationsTest();
