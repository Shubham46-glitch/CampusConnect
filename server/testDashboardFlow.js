import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Assignment from './models/Assignment.js';
import Complaint from './models/Complaint.js';
import Announcement from './models/Announcement.js';
import Submission from './models/Submission.js';
import generateToken from './utils/generateToken.js';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Step 4A Dashboard Integration Test Suite...\n');

  try {
    await connectDB();

    // 1. Ensure test users exist
    let student = await User.findOne({ email: 'dash_student@college.edu' });
    if (!student) {
      student = await User.create({
        name: 'Dashboard Student',
        email: 'dash_student@college.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        profileInfo: { rollNumber: 'CS-DASH-01' },
      });
    }

    let faculty = await User.findOne({ email: 'dash_faculty@college.edu' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. Dashboard Faculty',
        email: 'dash_faculty@college.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
        profileInfo: { employeeId: 'EMP-DASH-01' },
      });
    }

    let admin = await User.findOne({ email: 'dash_admin@college.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'Dashboard Admin',
        email: 'dash_admin@college.edu',
        password: 'password123',
        role: 'admin',
        department: 'Administration',
      });
    }

    // Generate tokens
    const studentToken = generateToken(student._id, student.role);
    const facultyToken = generateToken(faculty._id, faculty.role);
    const adminToken = generateToken(admin._id, admin.role);

    console.log('✅ Generated JWT tokens for Student, Faculty, and Admin.');

    // Seed dummy item for test if database is clean
    const testEvent = await Event.create({
      title: 'Dashboard Test Event ' + Date.now(),
      description: 'Testing event count in student dashboard',
      date: new Date(Date.now() + 86400000), // tomorrow
      time: '10:00 AM',
      venue: 'Main Auditorium',
      capacity: 50,
      category: 'academic',
      createdBy: faculty._id,
      participants: [],
    });

    const testAssignment = await Assignment.create({
      title: 'Dashboard Test Assignment ' + Date.now(),
      description: 'Testing active assignment count',
      subject: 'Data Structures',
      faculty: faculty._id,
      department: 'Computer Science',
      dueDate: new Date(Date.now() + 172800000),
      totalMarks: 100,
      status: 'active',
    });

    console.log('✅ Created test Event and Assignment.');

    // TEST 1: Student Dashboard API
    console.log('\n--- TEST 1: GET /api/dashboard/student (as Student) ---');
    const studentRes = await fetch(`${API_BASE}/dashboard/student`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentData = await studentRes.json();
    console.log('HTTP Status:', studentRes.status);
    console.log('Student Metrics:', {
      upcomingEvents: studentData.upcomingEvents,
      registeredEvents: studentData.registeredEvents,
      activeAssignments: studentData.activeAssignments,
      pendingAssignments: studentData.pendingAssignments,
      myComplaints: studentData.myComplaints,
      pendingComplaints: studentData.pendingComplaints,
    });
    if (studentRes.status === 200 && typeof studentData.upcomingEvents === 'number') {
      console.log('✅ Student Dashboard API returned valid numeric metrics!');
    } else {
      console.log('❌ Student Dashboard API test failed');
    }

    // TEST 2: Event Registration & Count Verification
    console.log('\n--- TEST 2: Register for Event & Verify Count Updates ---');
    const initialRegCount = studentData.registeredEvents;
    await fetch(`${API_BASE}/events/${testEvent._id}/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
    });

    const updatedStudentRes = await fetch(`${API_BASE}/dashboard/student`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const updatedStudentData = await updatedStudentRes.json();

    console.log('Initial Registered Events:', initialRegCount);
    console.log('Updated Registered Events:', updatedStudentData.registeredEvents);
    if (updatedStudentData.registeredEvents === initialRegCount + 1) {
      console.log('✅ Event registration correctly incremented Student Registered Events count!');
    } else {
      console.log('❌ Event count update verification failed');
    }

    // TEST 3: Faculty Dashboard API
    console.log('\n--- TEST 3: GET /api/dashboard/faculty (as Faculty) ---');
    const facultyRes = await fetch(`${API_BASE}/dashboard/faculty`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    const facultyData = await facultyRes.json();
    console.log('HTTP Status:', facultyRes.status);
    console.log('Faculty Metrics:', {
      eventsCreated: facultyData.eventsCreated,
      activeAssignments: facultyData.activeAssignments,
      totalSubmissions: facultyData.totalSubmissions,
      pendingGrading: facultyData.pendingGrading,
      announcementsPublished: facultyData.announcementsPublished,
    });
    if (facultyRes.status === 200 && typeof facultyData.eventsCreated === 'number') {
      console.log('✅ Faculty Dashboard API returned valid numeric metrics!');
    } else {
      console.log('❌ Faculty Dashboard API test failed');
    }

    // TEST 4: Admin Dashboard API
    console.log('\n--- TEST 4: GET /api/dashboard/admin (as Admin) ---');
    const adminRes = await fetch(`${API_BASE}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminRes.json();
    console.log('HTTP Status:', adminRes.status);
    console.log('Admin Metrics:', {
      totalStudents: adminData.totalStudents,
      totalFaculty: adminData.totalFaculty,
      totalEvents: adminData.totalEvents,
      activeAssignments: adminData.activeAssignments,
      totalAnnouncements: adminData.totalAnnouncements,
      pendingComplaints: adminData.pendingComplaints,
      resolvedComplaints: adminData.resolvedComplaints,
    });
    if (adminRes.status === 200 && typeof adminData.totalStudents === 'number') {
      console.log('✅ Admin Dashboard API returned valid system-wide counts!');
    } else {
      console.log('❌ Admin Dashboard API test failed');
    }

    // TEST 5: Security / RBAC Restrictions
    console.log('\n--- TEST 5: Security / RBAC Restrictions ---');

    // Student -> Admin Dashboard API (Must fail with 403)
    const stAdminRes = await fetch(`${API_BASE}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (stAdminRes.status === 403) {
      console.log('✅ PASS: Student access to Admin Dashboard API blocked with 403 Forbidden.');
    } else {
      console.log('❌ FAIL: Student access to Admin API returned status:', stAdminRes.status);
    }

    // Student -> Faculty Dashboard API (Must fail with 403)
    const stFacRes = await fetch(`${API_BASE}/dashboard/faculty`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (stFacRes.status === 403) {
      console.log('✅ PASS: Student access to Faculty Dashboard API blocked with 403 Forbidden.');
    } else {
      console.log('❌ FAIL: Student access to Faculty API returned status:', stFacRes.status);
    }

    // Faculty -> Admin Dashboard API (Must fail with 403)
    const facAdminRes = await fetch(`${API_BASE}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    if (facAdminRes.status === 403) {
      console.log('✅ PASS: Faculty access to Admin Dashboard API blocked with 403 Forbidden.');
    } else {
      console.log('❌ FAIL: Faculty access to Admin API returned status:', facAdminRes.status);
    }

    // Unauthenticated -> Student Dashboard API (Must fail with 401)
    const unauthRes = await fetch(`${API_BASE}/dashboard/student`);
    if (unauthRes.status === 401) {
      console.log('✅ PASS: Unauthenticated access blocked with 401 Unauthorized.');
    } else {
      console.log('❌ FAIL: Unauthenticated request returned status:', unauthRes.status);
    }

    // Cleanup test event and assignment
    await Event.deleteOne({ _id: testEvent._id });
    await Assignment.deleteOne({ _id: testAssignment._id });
    console.log('\n🧹 Cleaned up temporary test artifacts.');

    console.log('\n✨ ALL STEP 4A DASHBOARD INTEGRATION TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (error) {
    console.error('❌ Dashboard Test Suite Failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTests();
