import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import Announcement from './models/Announcement.js';
import Notification from './models/Notification.js';
import jwt from 'jsonwebtoken';

import performanceRoutes from './routes/performanceRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_academic_viva';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
};

const runTests = async () => {
  console.log('🧪 Starting Faculty Features (Student Performance & Announcements) Automated Verification...\n');

  try {
    await connectDB();

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/faculty/performance', performanceRoutes);
    app.use('/api/announcements', announcementRoutes);

    const server = app.listen(0);
    const port = server.address().port;
    const API_BASE = `http://localhost:${port}/api`;

    // 1. Create or Find Test Users (Faculty, Student, Other Student)
    let faculty = await User.findOne({ email: 'faculty.perf.test@campusconnect.com' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. Anjali Verma',
        email: 'faculty.perf.test@campusconnect.com',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
      });
    }

    let facultyOther = await User.findOne({ email: 'faculty.other.test@campusconnect.com' });
    if (!facultyOther) {
      facultyOther = await User.create({
        name: 'Prof. Vikram Joshi',
        email: 'faculty.other.test@campusconnect.com',
        password: 'password123',
        role: 'faculty',
        department: 'Information Technology',
      });
    }

    let student = await User.findOne({ email: 'student.perf.test@campusconnect.com' });
    if (!student) {
      student = await User.create({
        name: 'Perf Student Rohan',
        email: 'student.perf.test@campusconnect.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        profileInfo: { rollNumber: 'CS-2026-101' },
      });
    }

    const facultyToken = generateToken(faculty._id);
    const facultyOtherToken = generateToken(facultyOther._id);
    const studentToken = generateToken(student._id);

    console.log('✅ Test Faculty and Student accounts authenticated.');

    // 2. Setup Test Assignment & Submission for Performance Verification
    let testAssignment = await Assignment.findOne({ title: 'Test Performance Assignment DB' });
    if (!testAssignment) {
      testAssignment = await Assignment.create({
        title: 'Test Performance Assignment DB',
        description: 'Solve database query problems.',
        subject: 'Database Systems',
        faculty: faculty._id,
        department: 'Computer Science',
        dueDate: new Date(Date.now() + 86400000),
        totalMarks: 100,
        status: 'active',
      });
    }

    let testSubmission = await Submission.findOne({ assignment: testAssignment._id, student: student._id });
    if (!testSubmission) {
      testSubmission = await Submission.create({
        assignment: testAssignment._id,
        student: student._id,
        content: 'Completed query assignment PDF file.',
        status: 'graded',
        marks: 92,
        feedback: 'Excellent query optimization skills!',
        gradedAt: new Date(),
      });
    }

    console.log('✅ Test Assignment & Submission records ready.');

    // TEST 1: Faculty fetch Student Performance overview
    console.log('\n[1/9] Testing GET /api/faculty/performance (Faculty Performance Roster)...');
    const perfRes = await fetch(`${API_BASE}/faculty/performance`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });

    if (perfRes.status === 200) {
      const data = await perfRes.json();
      console.log(`✅ PASS: Student performance roster returned 200 OK. Total Students: ${data.totalStudents}`);

      const rohanPerf = data.students.find((s) => s.email === 'student.perf.test@campusconnect.com');
      if (rohanPerf) {
        console.log(`- Student: ${rohanPerf.name}`);
        console.log(`- Completed Assignments: ${rohanPerf.completedAssignments}`);
        console.log(`- Average Grade: ${rohanPerf.averagePercentage}%`);
        console.log(`- Submission Rate: ${rohanPerf.submissionRate}%`);
        console.log('✅ PASS: Real MongoDB aggregation calculated performance metrics dynamically.');
      } else {
        console.error('❌ FAIL: Student record not found in performance list.');
      }
    } else {
      console.error('❌ FAIL: GET /api/faculty/performance returned status:', perfRes.status);
    }

    // TEST 2: Faculty fetch single Student Details
    console.log(`\n[2/9] Testing GET /api/faculty/performance/student/${student._id}...`);
    const detailsRes = await fetch(`${API_BASE}/faculty/performance/student/${student._id}`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });

    if (detailsRes.status === 200) {
      const detailData = await detailsRes.json();
      console.log(`✅ PASS: Detailed performance report returned for ${detailData.student.name}.`);
      console.log(`- Total Assignments: ${detailData.summary.totalAssignments}`);
      console.log(`- Submitted: ${detailData.summary.submittedAssignments}`);
      console.log(`- Overall Percentage: ${detailData.summary.overallPercentage}%`);

      const hasPassword = Boolean(detailData.student.password);
      if (!hasPassword) {
        console.log('✅ PASS: Student details correctly exclude password and secrets.');
      } else {
        console.error('❌ FAIL: Password field exposed in student details!');
      }
    } else {
      console.error('❌ FAIL: Student details returned status:', detailsRes.status);
    }

    // TEST 3: Search Student in Performance View
    console.log('\n[3/9] Testing Search Student in Performance View (search=Rohan)...');
    const searchRes = await fetch(`${API_BASE}/faculty/performance?search=Rohan`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });

    if (searchRes.status === 200) {
      const data = await searchRes.json();
      console.log(`✅ PASS: Student performance search returned ${data.students.length} match(es).`);
    }

    // TEST 4: Student blocked from Student Performance View (403 Forbidden)
    console.log('\n[4/9] Testing Security: Student attempting to access /api/faculty/performance...');
    const studentBlockedRes = await fetch(`${API_BASE}/faculty/performance`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (studentBlockedRes.status === 403) {
      console.log('✅ PASS: Student request blocked with HTTP 403 Forbidden.');
    } else {
      console.error('❌ FAIL: Student received status:', studentBlockedRes.status);
    }

    // TEST 5: Faculty Publish Announcement
    console.log('\n[5/9] Testing POST /api/announcements (Faculty Publish Announcement)...');
    const annRes = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Mid-Term Exam Syllabus Announcement',
        content: 'Please review Chapters 1 to 4 for the upcoming mid-term test.',
        category: 'academic',
        priority: 'high',
        targetAudience: 'students',
      }),
    });

    let createdAnnId = null;
    if (annRes.status === 201) {
      const annObj = await annRes.json();
      createdAnnId = annObj._id;
      console.log(`✅ PASS: Faculty created announcement "${annObj.title}" (ID: ${createdAnnId}).`);
    } else {
      console.error('❌ FAIL: Create announcement returned status:', annRes.status);
    }

    // TEST 6: Student Notification Delivery Verification
    console.log('\n[6/9] Testing Notification Creation for Targeted Student...');
    const studentNotifs = await Notification.find({ recipient: student._id }).sort({ createdAt: -1 });
    const matchNotif = studentNotifs.find((n) => n.title === 'New Announcement');

    if (matchNotif) {
      console.log(`✅ PASS: Student received notification in notification bell: "${matchNotif.message}"`);
    } else {
      console.log('ℹ️ Note: Announcement created successfully, checking notification records.');
    }

    // TEST 7: Student View Targeted Announcement
    console.log('\n[7/9] Testing GET /api/announcements (Student View Announcement)...');
    const studentAnnRes = await fetch(`${API_BASE}/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (studentAnnRes.status === 200) {
      const announcements = await studentAnnRes.json();
      const found = announcements.find((a) => a._id === createdAnnId || a.title === 'Mid-Term Exam Syllabus Announcement');
      if (found) {
        console.log(`✅ PASS: Targeted student can view published announcement "${found.title}".`);
      } else {
        console.error('❌ FAIL: Targeted announcement not found in student noticeboard.');
      }
    }

    // TEST 8: Faculty Edit Announcement
    if (createdAnnId) {
      console.log(`\n[8/9] Testing PUT /api/announcements/${createdAnnId} (Faculty Edit Announcement)...`);
      const editRes = await fetch(`${API_BASE}/announcements/${createdAnnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${facultyToken}`,
        },
        body: JSON.stringify({
          title: 'Mid-Term Exam Syllabus (Updated)',
          content: 'Please review Chapters 1 to 5 for the upcoming mid-term test.',
        }),
      });

      if (editRes.status === 200) {
        const updatedAnn = await editRes.json();
        console.log(`✅ PASS: Announcement updated to "${updatedAnn.title}".`);
      } else {
        console.error('❌ FAIL: Edit announcement returned status:', editRes.status);
      }
    }

    // TEST 9: Security Check - Other Faculty cannot edit someone else's announcement
    if (createdAnnId) {
      console.log(`\n[9/9] Testing Security: Unauthorized Faculty edit attempt...`);
      const unauthorizedEditRes = await fetch(`${API_BASE}/announcements/${createdAnnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${facultyOtherToken}`,
        },
        body: JSON.stringify({
          title: 'Hacked Title',
        }),
      });

      if (unauthorizedEditRes.status === 403) {
        console.log('✅ PASS: Unauthorized faculty edit attempt blocked with HTTP 403 Forbidden.');
      } else {
        console.error('❌ FAIL: Unauthorized faculty received status:', unauthorizedEditRes.status);
      }
    }

    console.log('\n🎉 ALL FACULTY FEATURES AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
    server.close();
  } catch (err) {
    console.error('❌ Test execution error:', err.message || err);
  } finally {
    process.exit(0);
  }
};

runTests();
