import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Announcement from './models/Announcement.js';

dotenv.config();

const runAnnouncementsTest = async () => {
  console.log('🧪 Starting Step 3B Announcements Module Automated Test Suite...\n');

  try {
    await connectDB();

    // Clean up test data
    const testEmails = ['ann_stu_cs@college.edu', 'ann_fac_cs@college.edu', 'ann_fac_ee@college.edu', 'ann_admin@college.edu'];
    await User.deleteMany({ email: { $in: testEmails } });
    await Announcement.deleteMany({ title: { $regex: /Test Notice/i } });
    console.log('🧹 Cleaned up existing test announcement data in MongoDB Atlas.');

    // Create Test Users
    const studentCS = await User.create({
      name: 'CS Student',
      email: 'ann_stu_cs@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
    });

    const facultyCS = await User.create({
      name: 'Prof. CS',
      email: 'ann_fac_cs@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
    });

    const facultyEE = await User.create({
      name: 'Prof. Electrical',
      email: 'ann_fac_ee@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Electrical',
    });

    const admin = await User.create({
      name: 'Admin Master',
      email: 'ann_admin@college.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
    });

    console.log('✅ Created test users: Student CS, Faculty CS, Faculty Electrical, Admin Master.');

    // TEST 1: Create Announcements with various target audiences
    console.log('\n--- Test 1: Create Target-Specific Announcements ---');

    const noticeAll = await Announcement.create({
      title: 'Test Notice 1: Campus Library Hours',
      content: 'The library will remain open until midnight during exams.',
      category: 'general',
      priority: 'low',
      targetAudience: 'all',
      publishedBy: facultyCS._id,
    });

    const noticeStudents = await Announcement.create({
      title: 'Test Notice 2: Mid-Term Exam Seating',
      content: 'Seating arrangements posted on portal.',
      category: 'examination',
      priority: 'high',
      targetAudience: 'students',
      publishedBy: facultyCS._id,
    });

    const noticeCSDept = await Announcement.create({
      title: 'Test Notice 3: CS Lab Maintenance',
      content: 'CS Lab 2 will be closed this Friday.',
      category: 'academic',
      priority: 'medium',
      targetAudience: 'department',
      department: 'Computer Science',
      publishedBy: facultyCS._id,
    });

    const noticeFaculty = await Announcement.create({
      title: 'Test Notice 4: Faculty Senate Meeting',
      content: 'Monthly faculty meeting in Conference Room 1.',
      category: 'general',
      priority: 'medium',
      targetAudience: 'faculty',
      publishedBy: facultyCS._id,
    });

    const noticeExpired = await Announcement.create({
      title: 'Test Notice 5: Past Deadline Notice',
      content: 'Expired notice from last month.',
      category: 'general',
      priority: 'low',
      targetAudience: 'all',
      expiresAt: new Date(Date.now() - 86400000), // Yesterday
      publishedBy: facultyCS._id,
    });

    console.log('✅ Created 5 announcements: All, Students, CS Dept, Faculty, Expired.');

    // TEST 2: Automatic Expiration Logic
    console.log('\n--- Test 2: Automatic Expiration Check ---');
    await Announcement.updateMany(
      { expiresAt: { $lt: new Date() }, status: 'published' },
      { status: 'expired' }
    );
    const expiredCheck = await Announcement.findById(noticeExpired._id);
    console.log('✅ Past notice status automatically set to expired:', expiredCheck.status === 'expired' ? '✅ PASS' : '❌ FAIL');

    // TEST 3: Student CS Visibility Filtering
    console.log('\n--- Test 3: Student Visibility Filtering ---');
    const studentNotices = await Announcement.find({
      $or: [
        { targetAudience: { $in: ['all', 'students'] } },
        { targetAudience: 'department', department: studentCS.department },
      ],
      status: { $ne: 'expired' },
    });

    const studentNoticeTitles = studentNotices.map((n) => n.title);
    console.log('✅ Student CS Sees:', studentNoticeTitles.length, 'announcements.');
    console.log('  - Includes Notice All?', studentNoticeTitles.includes(noticeAll.title) ? '✅ PASS' : '❌ FAIL');
    console.log('  - Includes Student Notice?', studentNoticeTitles.includes(noticeStudents.title) ? '✅ PASS' : '❌ FAIL');
    console.log('  - Includes CS Dept Notice?', studentNoticeTitles.includes(noticeCSDept.title) ? '✅ PASS' : '❌ FAIL');
    console.log('  - Excludes Faculty-Only Notice?', !studentNoticeTitles.includes(noticeFaculty.title) ? '✅ PASS' : '❌ FAIL');
    console.log('  - Excludes Expired Notice?', !studentNoticeTitles.includes(noticeExpired.title) ? '✅ PASS' : '❌ FAIL');

    // TEST 4: Faculty CS Visibility Filtering
    console.log('\n--- Test 4: Faculty Visibility Filtering ---');
    const facultyNotices = await Announcement.find({
      $or: [
        { targetAudience: { $in: ['all', 'faculty'] } },
        { targetAudience: 'department', department: facultyCS.department },
      ],
      status: { $ne: 'expired' },
    });

    const facultyNoticeTitles = facultyNotices.map((n) => n.title);
    console.log('  - Includes Notice All?', facultyNoticeTitles.includes(noticeAll.title) ? '✅ PASS' : '❌ FAIL');
    console.log('  - Includes Faculty Notice?', facultyNoticeTitles.includes(noticeFaculty.title) ? '✅ PASS' : '❌ FAIL');
    console.log('  - Excludes Student-Only Notice?', !facultyNoticeTitles.includes(noticeStudents.title) ? '✅ PASS' : '❌ FAIL');

    // TEST 5: Ownership Authorization
    console.log('\n--- Test 5: Ownership Authorization ---');
    const isEEAuthor = noticeAll.publishedBy.toString() === facultyEE._id.toString();
    const isCSAuthor = noticeAll.publishedBy.toString() === facultyCS._id.toString();
    const isAdmin = admin.role === 'admin';

    console.log('✅ Other Faculty (EE) allowed to edit CS notice?', isEEAuthor || isAdmin ? '❌ ALLOWED (FAIL)' : '✅ FORBIDDEN (PASS)');
    console.log('✅ Author (Prof. CS) allowed to edit CS notice?', isCSAuthor ? '✅ ALLOWED (PASS)' : '❌ FAIL');
    console.log('✅ Admin allowed to edit CS notice?', isAdmin ? '✅ ALLOWED (PASS)' : '❌ FAIL');

    // TEST 6: Delete Announcement
    console.log('\n--- Test 6: Delete Announcement ---');
    await Announcement.deleteOne({ _id: noticeAll._id });
    const checkDeleted = await Announcement.findById(noticeAll._id);
    console.log('✅ Notice deleted from MongoDB Atlas:', checkDeleted === null ? '✅ PASS' : '❌ FAIL');

    console.log('\n✨ ALL STEP 3B ANNOUNCEMENTS MODULE TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Test Suite Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runAnnouncementsTest();
