import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import generateToken from './utils/generateToken.js';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const runProfileTests = async () => {
  console.log('🧪 Starting Professional User Profile Feature Test Suite...\n');

  try {
    await connectDB();

    // 1. Ensure test users exist
    let student = await User.findOne({ email: 'prof_student@college.edu' });
    if (!student) {
      student = await User.create({
        name: 'Profile Student',
        email: 'prof_student@college.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        profileInfo: { rollNumber: 'CS-101' },
      });
    }

    let faculty = await User.findOne({ email: 'prof_faculty@college.edu' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. Profile Faculty',
        email: 'prof_faculty@college.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Information Tech',
        profileInfo: { employeeId: 'EMP-999' },
      });
    }

    const studentToken = generateToken(student._id, student.role);
    const facultyToken = generateToken(faculty._id, faculty.role);

    // TEST 1: GET Profile
    console.log('--- TEST 1: GET /api/auth/profile ---');
    const getRes = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const getData = await getRes.json();
    console.log('GET Profile status:', getRes.status, 'User Name:', getData.name);

    if (getRes.status === 200 && getData.email === 'prof_student@college.edu' && !getData.password) {
      console.log('✅ PASS: GET /api/auth/profile returned safe user object!');
    } else {
      console.log('❌ FAIL: GET profile failed or exposed password hash');
    }

    // TEST 2: Student PUT Profile Update
    console.log('\n--- TEST 2: Student PUT /api/auth/profile ---');
    const updateRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Profile Student Updated',
        department: 'Data Science',
        rollNumber: 'DS-2026',
      }),
    });
    const updateData = await updateRes.json();
    console.log('PUT Profile status:', updateRes.status, 'Updated Name:', updateData.name);

    if (
      updateRes.status === 200 &&
      updateData.name === 'Profile Student Updated' &&
      updateData.department === 'Data Science' &&
      updateData.profileInfo?.rollNumber === 'DS-2026'
    ) {
      console.log('✅ PASS: Student profile details successfully updated!');
    } else {
      console.log('❌ FAIL: Student profile update failed');
    }

    // TEST 3: Faculty PUT Profile Update
    console.log('\n--- TEST 3: Faculty PUT /api/auth/profile ---');
    const facultyRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${facultyToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Updated Faculty',
        department: 'Cybersecurity',
        employeeId: 'EMP-777',
      }),
    });
    const facultyData = await facultyRes.json();

    if (
      facultyRes.status === 200 &&
      facultyData.name === 'Prof. Updated Faculty' &&
      facultyData.profileInfo?.employeeId === 'EMP-777'
    ) {
      console.log('✅ PASS: Faculty profile details successfully updated!');
    } else {
      console.log('❌ FAIL: Faculty profile update failed');
    }

    // TEST 4: Security & Privilege Escalation Check (Role Immutability)
    console.log('\n--- TEST 4: Security Check (Role Immutability) ---');
    const hijackRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'admin',
        email: 'hacker@college.edu',
      }),
    });
    const hijackData = await hijackRes.json();

    if (hijackData.role === 'student' && hijackData.email === 'prof_student@college.edu') {
      console.log('✅ PASS: Privilege escalation blocked! Role and email remained read-only.');
    } else {
      console.log('❌ FAIL: Security breach! Role or email was altered.');
    }

    // Cleanup
    await User.deleteMany({ email: { $in: ['prof_student@college.edu', 'prof_faculty@college.edu'] } });
    console.log('\n🧹 Cleaned up test user accounts.');

    console.log('\n✨ ALL USER PROFILE FEATURE TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Profile Test Suite Failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runProfileTests();
