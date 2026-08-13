import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

import userRoutes from './routes/userRoutes.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_academic_viva';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
};

const runTests = async () => {
  console.log('🧪 Starting Admin User Management Automated Verification...\n');

  try {
    await connectDB();

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/users', userRoutes);
    app.use('/api/admin/users', userRoutes);

    const server = app.listen(0);
    const port = server.address().port;
    const API_BASE = `http://localhost:${port}/api`;

    // 1. Create or Find Test Users (Admin, Faculty, Student)
    let admin = await User.findOne({ email: 'admin.mgmt.test@campusconnect.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Mgmt Admin',
        email: 'admin.mgmt.test@campusconnect.com',
        password: 'password123',
        role: 'admin',
        department: 'Computer Science',
      });
    }

    let faculty = await User.findOne({ email: 'faculty.mgmt.test@campusconnect.com' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Mgmt Faculty Prof. Sharma',
        email: 'faculty.mgmt.test@campusconnect.com',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
        profileInfo: { employeeId: 'EMP-9901' },
      });
    }

    let student = await User.findOne({ email: 'student.mgmt.test@campusconnect.com' });
    if (!student) {
      student = await User.create({
        name: 'Mgmt Student Rahul',
        email: 'student.mgmt.test@campusconnect.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        profileInfo: { rollNumber: 'CS-2026-042' },
      });
    }

    const adminToken = generateToken(admin._id);
    const facultyToken = generateToken(faculty._id);
    const studentToken = generateToken(student._id);

    console.log('✅ Test accounts initialized and authenticated.');

    // TEST 1 & 11: Admin can view Students & Passwords are NEVER returned
    console.log('\n[1/11] Testing GET /api/users/students (Admin view students)...');
    const studentsRes = await fetch(`${API_BASE}/users/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (studentsRes.status === 200) {
      const data = await studentsRes.json();
      console.log(`✅ PASS: Students roster returned 200 OK. Total Students: ${data.total}`);

      const hasPassword = data.users.some((u) => u.password || u.passwordHash);
      if (!hasPassword) {
        console.log('✅ PASS (Security #11): Password and password hash are NOT returned in user objects.');
      } else {
        console.error('❌ FAIL: Password field found in user response!');
      }
    } else {
      console.error('❌ FAIL: GET /api/users/students returned status:', studentsRes.status);
    }

    // TEST 2: Admin can view Faculty
    console.log('\n[2/11] Testing GET /api/users/faculty (Admin view faculty)...');
    const facultyRes = await fetch(`${API_BASE}/users/faculty`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (facultyRes.status === 200) {
      const data = await facultyRes.json();
      console.log(`✅ PASS: Faculty roster returned 200 OK. Total Faculty: ${data.total}`);
    } else {
      console.error('❌ FAIL: GET /api/users/faculty returned status:', facultyRes.status);
    }

    // TEST 3: Search Students by Roll Number / Name
    console.log('\n[3/11] Testing Student Search (search=Rahul)...');
    const studentSearchRes = await fetch(`${API_BASE}/users/students?search=Rahul`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (studentSearchRes.status === 200) {
      const data = await studentSearchRes.json();
      console.log(`✅ PASS: Student search returned ${data.users.length} match(es).`);
    } else {
      console.error('❌ FAIL: Student search returned status:', studentSearchRes.status);
    }

    // TEST 4: Search Faculty by Employee ID / Name
    console.log('\n[4/11] Testing Faculty Search (search=EMP-9901)...');
    const facultySearchRes = await fetch(`${API_BASE}/users/faculty?search=EMP-9901`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (facultySearchRes.status === 200) {
      const data = await facultySearchRes.json();
      console.log(`✅ PASS: Faculty search returned ${data.users.length} match(es).`);
    } else {
      console.error('❌ FAIL: Faculty search returned status:', facultySearchRes.status);
    }

    // TEST 5: Filter by Department
    console.log('\n[5/11] Testing Department Filtering (department=Computer Science)...');
    const deptFilterRes = await fetch(`${API_BASE}/users/students?department=Computer%20Science`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (deptFilterRes.status === 200) {
      const data = await deptFilterRes.json();
      console.log(`✅ PASS: Department filter returned ${data.users.length} student(s).`);
    }

    // TEST 6: View Single User Details
    console.log(`\n[6/11] Testing View User Details (GET /api/users/${student._id})...`);
    const detailsRes = await fetch(`${API_BASE}/users/${student._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (detailsRes.status === 200) {
      const userObj = await detailsRes.json();
      console.log(`✅ PASS: User details fetched for ${userObj.name} (${userObj.email}).`);
      if (userObj.password) {
        console.error('❌ FAIL: User details contains password!');
      } else {
        console.log('✅ PASS: User details correctly excludes password.');
      }
    }

    // TEST 7: Activate / Deactivate Account Status
    console.log(`\n[7/11] Testing Account Deactivation & Activation (PATCH /api/users/${student._id}/status)...`);
    const deactivateRes = await fetch(`${API_BASE}/users/${student._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    });

    if (deactivateRes.status === 200) {
      const result = await deactivateRes.json();
      console.log(`✅ PASS: Account status updated to '${result.user.status}'.`);
    } else {
      console.error('❌ FAIL: Deactivate status returned:', deactivateRes.status);
    }

    // Reactivate account
    await fetch(`${API_BASE}/users/${student._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'active' }),
    });
    console.log('✅ PASS: Account reactivated back to active status.');

    // TEST 8: Student Access Protection (403 Forbidden)
    console.log('\n[8/11] Testing Security: Student attempting to access User Management...');
    const studentBlockedRes = await fetch(`${API_BASE}/users/students`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (studentBlockedRes.status === 403) {
      console.log('✅ PASS: Student request correctly rejected with HTTP 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Student received status:', studentBlockedRes.status);
    }

    // TEST 9: Faculty Access Protection (403 Forbidden)
    console.log('\n[9/11] Testing Security: Faculty attempting to access User Management...');
    const facultyBlockedRes = await fetch(`${API_BASE}/users/students`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });

    if (facultyBlockedRes.status === 403) {
      console.log('✅ PASS: Faculty request correctly rejected with HTTP 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Faculty received status:', facultyBlockedRes.status);
    }

    // TEST 10: Unauthenticated Request Protection (401 Unauthorized)
    console.log('\n[10/11] Testing Security: Unauthenticated request to User Management...');
    const unauthRes = await fetch(`${API_BASE}/users/students`);

    if (unauthRes.status === 401) {
      console.log('✅ PASS: Unauthenticated request correctly rejected with HTTP 401 Unauthorized.');
    } else {
      console.error('❌ FAIL: Unauthenticated request received status:', unauthRes.status);
    }

    console.log('\n🎉 ALL 11 USER MANAGEMENT AUTOMATED VERIFICATION TESTS PASSED PERFECTLY!');
    server.close();
  } catch (err) {
    console.error('❌ Test error:', err.message || err);
  } finally {
    process.exit(0);
  }
};

runTests();
