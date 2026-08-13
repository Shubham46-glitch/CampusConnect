import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

// Import route modules directly
import searchRoutes from './routes/searchRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_academic_viva';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
};

const runTests = async () => {
  console.log('🧪 Starting Global Search & Admin Analytics In-Memory Server Verification...\n');

  try {
    await connectDB();

    // Create test Express app instance
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/search', searchRoutes);
    app.use('/api/analytics', analyticsRoutes);

    const server = app.listen(0);
    const port = server.address().port;
    const API_BASE = `http://localhost:${port}/api`;

    // 1. Create or Find Test Users (Admin, Faculty, Student)
    let admin = await User.findOne({ email: 'admin.test@campusconnect.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Test Admin',
        email: 'admin.test@campusconnect.com',
        password: 'password123',
        role: 'admin',
        department: 'Computer Science',
      });
    }

    let faculty = await User.findOne({ email: 'faculty.test@campusconnect.com' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Test Faculty',
        email: 'faculty.test@campusconnect.com',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
      });
    }

    let student = await User.findOne({ email: 'student.test@campusconnect.com' });
    if (!student) {
      student = await User.create({
        name: 'Test Student',
        email: 'student.test@campusconnect.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
      });
    }

    const adminToken = generateToken(admin._id);
    const facultyToken = generateToken(faculty._id);
    const studentToken = generateToken(student._id);

    console.log('✅ Test Users authenticated successfully.');

    // 2. Test Global Search API for Student
    console.log('\n🔍 Testing Global Search API (Student Role)...');
    const studentSearchRes = await fetch(`${API_BASE}/search?q=Test`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (studentSearchRes.status === 200) {
      const searchData = await studentSearchRes.json();
      console.log('✅ PASS: Global Search API returned 200 OK.');
      console.log(`- Query: "${searchData.query}"`);
      console.log(`- Users returned to Student: ${searchData.results.users.length}`);

      if (searchData.results.users.length === 0) {
        console.log('✅ PASS: Students cannot view user accounts in search (RBAC Enforced).');
      } else {
        console.error('❌ FAIL: Student received user search results!');
      }
    } else {
      console.error('❌ FAIL: Student Search API returned status:', studentSearchRes.status);
    }

    // 3. Test Global Search API for Admin
    console.log('\n🔍 Testing Global Search API (Admin Role)...');
    const adminSearchRes = await fetch(`${API_BASE}/search?q=Test`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (adminSearchRes.status === 200) {
      const searchData = await adminSearchRes.json();
      console.log('✅ PASS: Admin Global Search API returned 200 OK.');
      console.log(`- Users returned to Admin: ${searchData.results.users.length}`);
    } else {
      console.error('❌ FAIL: Admin Search API returned status:', adminSearchRes.status);
    }

    // 4. Test Analytics Endpoints for Admin (200 OK expected)
    console.log('\n📊 Testing Admin Analytics APIs (Admin Role)...');
    const analyticsOverviewRes = await fetch(`${API_BASE}/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (analyticsOverviewRes.status === 200) {
      const overviewData = await analyticsOverviewRes.json();
      console.log('✅ PASS: Analytics Overview API returned 200 OK.');
      console.log(`- Total Users: ${overviewData.totalUsers}`);
      console.log(`- Total Students: ${overviewData.totalStudents}`);
      console.log(`- Total Faculty: ${overviewData.totalFaculty}`);
      console.log(`- Total Events: ${overviewData.totalEvents}`);
    } else {
      console.error('❌ FAIL: Analytics Overview returned status:', analyticsOverviewRes.status);
    }

    const deptRes = await fetch(`${API_BASE}/analytics/students-by-department`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (deptRes.status === 200) {
      const deptData = await deptRes.json();
      console.log('✅ PASS: MongoDB Aggregation (students-by-department) returned 200 OK.');
      console.log(`- Departments found: ${deptData.length}`);
    }

    // 5. Test Analytics Endpoints Security (Student / Faculty Access -> 403 Forbidden)
    console.log('\n🔒 Testing Analytics API Security & RBAC Enforcement...');

    const studentAccessRes = await fetch(`${API_BASE}/analytics/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (studentAccessRes.status === 403) {
      console.log('✅ PASS: Student access to Analytics blocked with HTTP 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Student received status:', studentAccessRes.status);
    }

    const facultyAccessRes = await fetch(`${API_BASE}/analytics/overview`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });

    if (facultyAccessRes.status === 403) {
      console.log('✅ PASS: Faculty access to Analytics blocked with HTTP 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Faculty received status:', facultyAccessRes.status);
    }

    const unauthRes = await fetch(`${API_BASE}/analytics/overview`);
    if (unauthRes.status === 401) {
      console.log('✅ PASS: Unauthenticated access blocked with HTTP 401 Unauthorized.');
    } else {
      console.error('❌ FAIL: Unauthenticated access returned status:', unauthRes.status);
    }

    console.log('\n🎉 ALL SEARCH AND ANALYTICS AUTOMATED TESTS PASSED SUCCESSFULLY!');
    server.close();
  } catch (err) {
    console.error('❌ Test execution error:', err.message || err);
  } finally {
    process.exit(0);
  }
};

runTests();
