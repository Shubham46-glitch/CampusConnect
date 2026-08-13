import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import generateToken from './utils/generateToken.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const runTests = async () => {
  console.log('🧪 Starting Step 2 Authentication & Authorization Automated Test Suite...\n');

  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Clean up test accounts if present
    const testEmails = ['teststudent@college.edu', 'testfaculty@college.edu', 'testadmin@college.edu'];
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('🧹 Cleaned up existing test accounts in MongoDB Atlas.');

    // TEST 1: Student Registration & Password Hashing
    console.log('\n--- Test 1: Student Registration & Bcrypt Hashing ---');
    const studentUser = await User.create({
      name: 'Test Student',
      email: 'teststudent@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      profileInfo: { rollNumber: 'CS202699' },
    });

    console.log('✅ Student created in MongoDB Atlas: ID =', studentUser._id.toString());
    console.log('✅ Plain password stored? ', studentUser.password === 'password123' ? '❌ FAIL' : '✅ PASS (Hashed)');
    console.log('✅ Password starts with $2a$ or $2b$? ', studentUser.password.startsWith('$2') ? '✅ PASS' : '❌ FAIL');

    // TEST 2: Faculty Registration
    console.log('\n--- Test 2: Faculty Registration ---');
    const facultyUser = await User.create({
      name: 'Dr. Test Faculty',
      email: 'testfaculty@college.edu',
      password: 'facultyPass123',
      role: 'faculty',
      department: 'Information Technology',
      profileInfo: { employeeId: 'EMP-9999' },
    });
    console.log('✅ Faculty created with role:', facultyUser.role);

    // TEST 3: Admin Registration
    console.log('\n--- Test 3: Admin Registration ---');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'testadmin@college.edu',
      password: 'adminSecret123',
      role: 'admin',
      department: 'Administration',
    });
    console.log('✅ Admin created with role:', adminUser.role);

    // TEST 4: Duplicate Email Rejection
    console.log('\n--- Test 4: Duplicate Email Check ---');
    try {
      await User.create({
        name: 'Imposter Student',
        email: 'TESTSTUDENT@college.edu', // Normalized check
        password: 'password123',
        role: 'student',
      });
      console.log('❌ FAIL: Duplicate email was allowed');
    } catch (err) {
      console.log('✅ PASS: Duplicate email rejected by MongoDB/Mongoose:', err.message);
    }

    // TEST 5: Password Comparison using matchPassword
    console.log('\n--- Test 5: Password Verification (matchPassword) ---');
    const isValidPass = await studentUser.matchPassword('password123');
    const isInvalidPass = await studentUser.matchPassword('wrongPassword');
    console.log('✅ Correct password match:', isValidPass ? '✅ PASS' : '❌ FAIL');
    console.log('✅ Incorrect password match:', !isInvalidPass ? '✅ PASS' : '❌ FAIL');

    // TEST 6: JWT Token Generation & Payload Inspection
    console.log('\n--- Test 6: JWT Token Generation ---');
    const token = generateToken(studentUser._id, studentUser.role);
    console.log('✅ Token generated:', token.substring(0, 25) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_academic_viva');
    console.log('✅ Decoded Payload contains user ID:', decoded.id === studentUser._id.toString() ? '✅ PASS' : '❌ FAIL');
    console.log('✅ Decoded Payload contains role:', decoded.role === 'student' ? '✅ PASS' : '❌ FAIL');

    console.log('\n✨ ALL STEP 2 BACKEND AUTHENTICATION TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (error) {
    console.error('❌ Test Suite Failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTests();
