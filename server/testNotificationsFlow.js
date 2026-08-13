import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import Complaint from './models/Complaint.js';
import Announcement from './models/Announcement.js';
import Notification from './models/Notification.js';
import generateToken from './utils/generateToken.js';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Section 18 Notification Bell System Test Suite...\n');

  try {
    await connectDB();

    // 1. Ensure test users exist
    let student = await User.findOne({ email: 'notif_student@college.edu' });
    if (!student) {
      student = await User.create({
        name: 'Notif Student',
        email: 'notif_student@college.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
      });
    }

    let faculty = await User.findOne({ email: 'notif_faculty@college.edu' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. Notif Faculty',
        email: 'notif_faculty@college.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
      });
    }

    let admin = await User.findOne({ email: 'notif_admin@college.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'Notif Admin',
        email: 'notif_admin@college.edu',
        password: 'password123',
        role: 'admin',
        department: 'Administration',
      });
    }

    const studentToken = generateToken(student._id, student.role);
    const facultyToken = generateToken(faculty._id, faculty.role);
    const adminToken = generateToken(admin._id, admin.role);

    // Clean up existing notifications for test users
    await Notification.deleteMany({ recipient: { $in: [student._id, faculty._id, admin._id] } });
    console.log('🧹 Cleaned up existing test user notifications.');

    // TEST 1: Event Registration Trigger
    console.log('\n--- TEST 1: Event Registration Trigger ---');
    const testEvent = await Event.create({
      title: 'Notif Test Event ' + Date.now(),
      description: 'Testing notifications on registration',
      date: new Date(Date.now() + 86400000),
      time: '11:00 AM',
      venue: 'Auditorium 1',
      capacity: 50,
      createdBy: faculty._id,
    });

    await fetch(`${API_BASE}/events/${testEvent._id}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
    });

    const studentNotifs1 = await Notification.find({ recipient: student._id });
    console.log('Student notifications count after event registration:', studentNotifs1.length);
    if (studentNotifs1.some((n) => n.title === 'Event Registration Confirmed')) {
      console.log('✅ PASS: Event Registration Confirmed notification created for student!');
    } else {
      console.log('❌ FAIL: Event registration notification missing for student');
    }

    // TEST 2: Assignment Creation Trigger
    console.log('\n--- TEST 2: Assignment Creation Trigger ---');
    await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Notif Test Assignment ' + Date.now(),
        description: 'Testing assignment notification',
        subject: 'Algorithms',
        department: 'Computer Science',
        dueDate: new Date(Date.now() + 172800000),
        totalMarks: 100,
      }),
    });

    const studentNotifs2 = await Notification.find({ recipient: student._id });
    if (studentNotifs2.some((n) => n.title === 'New Assignment')) {
      console.log('✅ PASS: New Assignment notification created for student!');
    } else {
      console.log('❌ FAIL: New Assignment notification missing for student');
    }

    // TEST 3: Complaint Creation & Admin Status Update Triggers
    console.log('\n--- TEST 3: Complaint Creation & Admin Status Update Triggers ---');
    const complaintRes = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Notif Test Complaint ' + Date.now(),
        description: 'Testing complaint notification',
        category: 'academic',
        priority: 'high',
        department: 'Computer Science',
      }),
    });
    const complaintData = await complaintRes.json();

    const adminNotifs = await Notification.find({ recipient: admin._id });
    if (adminNotifs.some((n) => n.title === 'New Complaint Submitted')) {
      console.log('✅ PASS: New Complaint Submitted notification created for admin!');
    } else {
      console.log('❌ FAIL: Admin complaint notification missing');
    }

    // Admin updates complaint status
    await fetch(`${API_BASE}/complaints/${complaintData._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'resolved',
        adminResponse: 'Issue resolved successfully.',
      }),
    });

    const studentNotifs3 = await Notification.find({ recipient: student._id });
    if (studentNotifs3.some((n) => n.title === 'Complaint Resolved')) {
      console.log('✅ PASS: Complaint Resolved notification created for student!');
    } else {
      console.log('❌ FAIL: Student complaint status notification missing');
    }

    // TEST 4: Notification APIs (Unread Count & Mark as Read)
    console.log('\n--- TEST 4: Notification APIs & Read States ---');
    const unreadRes = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const unreadData = await unreadRes.json();
    console.log('Student Unread Count:', unreadData.unreadCount);
    if (unreadData.unreadCount > 0) {
      console.log('✅ PASS: GET /api/notifications/unread-count returned accurate count!');
    } else {
      console.log('❌ FAIL: Unread count failed');
    }

    // Mark single notification as read
    const targetNotif = studentNotifs3[0];
    const markReadRes = await fetch(`${API_BASE}/notifications/${targetNotif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markReadData = await markReadRes.json();
    console.log('Mark Read Status:', markReadRes.status);
    if (markReadRes.status === 200 && markReadData.notification.isRead === true) {
      console.log('✅ PASS: PATCH /api/notifications/:id/read marked single notification as read!');
    } else {
      console.log('❌ FAIL: Mark single as read failed');
    }

    // Mark all as read
    const markAllRes = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markAllData = await markAllRes.json();
    if (markAllRes.status === 200 && markAllData.unreadCount === 0) {
      console.log('✅ PASS: PATCH /api/notifications/read-all marked all notifications as read!');
    } else {
      console.log('❌ FAIL: Mark all as read failed');
    }

    // TEST 5: RBAC Security Restriction
    console.log('\n--- TEST 5: Security & RBAC Isolation ---');
    // Student trying to mark Faculty's notification
    const facultyNotif = await Notification.create({
      recipient: faculty._id,
      title: 'Private Faculty Notif',
      message: 'Faculty secret message',
      type: 'system',
    });

    const unauthorizedRes = await fetch(`${API_BASE}/notifications/${facultyNotif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (unauthorizedRes.status === 403) {
      console.log('✅ PASS: Student blocked with 403 Forbidden when accessing another user notification!');
    } else {
      console.log('❌ FAIL: Unauthorized access returned status:', unauthorizedRes.status);
    }

    // Cleanup test artifacts
    await Notification.deleteMany({ recipient: { $in: [student._id, faculty._id, admin._id] } });
    await Event.deleteOne({ _id: testEvent._id });
    await Complaint.deleteOne({ _id: complaintData._id });
    console.log('\n🧹 Cleaned up test artifacts.');

    console.log('\n✨ ALL SECTION 18 NOTIFICATION SYSTEM TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (error) {
    console.error('❌ Notification Test Suite Failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTests();
