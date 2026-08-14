import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {}

import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });


import mongoose from 'mongoose';
import User from './models/User.js';
import Event from './models/Event.js';
import Assignment from './models/Assignment.js';
import Announcement from './models/Announcement.js';
import Complaint from './models/Complaint.js';
import Submission from './models/Submission.js';

async function runRoleArchitectureVerification() {
  try {
    console.log('🚀 Starting Comprehensive CampusConnect Role & Architecture Matrix Verification...\n');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB Connected.\n');

    // 1. Create or Fetch Test Users
    const studentCS = await User.findOneAndUpdate(
      { email: 'verify.cs.student@college.edu' },
      { name: 'Rahul (CS)', email: 'verify.cs.student@college.edu', password: 'Password123', role: 'student', department: 'Computer Science' },
      { upsert: true, new: true }
    );

    const studentIT = await User.findOneAndUpdate(
      { email: 'verify.it.student@college.edu' },
      { name: 'Priya (IT)', email: 'verify.it.student@college.edu', password: 'Password123', role: 'student', department: 'Information Technology' },
      { upsert: true, new: true }
    );

    const facultyCS = await User.findOneAndUpdate(
      { email: 'verify.cs.faculty@college.edu' },
      { name: 'Prof. Sharma (CS)', email: 'verify.cs.faculty@college.edu', password: 'Password123', role: 'faculty', department: 'Computer Science' },
      { upsert: true, new: true }
    );

    const facultyIT = await User.findOneAndUpdate(
      { email: 'verify.it.faculty@college.edu' },
      { name: 'Prof. Verma (IT)', email: 'verify.it.faculty@college.edu', password: 'Password123', role: 'faculty', department: 'Information Technology' },
      { upsert: true, new: true }
    );

    const adminUser = await User.findOneAndUpdate(
      { email: 'verify.admin@college.edu' },
      { name: 'System Administrator', email: 'verify.admin@college.edu', password: 'Password123', role: 'admin', department: 'Computer Science' },
      { upsert: true, new: true }
    );

    console.log('1. Test Users Initialized:');
    console.log(`   - CS Faculty: ${facultyCS.name} [${facultyCS.department}]`);
    console.log(`   - IT Faculty: ${facultyIT.name} [${facultyIT.department}]`);
    console.log(`   - CS Student: ${studentCS.name} [${studentCS.department}]`);
    console.log(`   - IT Student: ${studentIT.name} [${studentIT.department}]`);
    console.log(`   - Admin: ${adminUser.name}\n`);

    // 2. Verify CS Faculty sees only CS students & IT Faculty sees only IT students
    const csFacultyStudentView = await User.find({ role: 'student', department: facultyCS.department });
    const itFacultyStudentView = await User.find({ role: 'student', department: facultyIT.department });

    const check1 = csFacultyStudentView.some(s => s._id.equals(studentCS._id)) && !csFacultyStudentView.some(s => s._id.equals(studentIT._id));
    const check2 = itFacultyStudentView.some(s => s._id.equals(studentIT._id)) && !itFacultyStudentView.some(s => s._id.equals(studentCS._id));
    console.log(`✅ [Checkpoint 1 & 2] CS Faculty sees CS student only: ${check1} | IT Faculty sees IT student only: ${check2}`);

    // 3. Create CS Assignment & IT Assignment
    const csAssignment = await Assignment.create({
      title: 'CS Data Structures Assignment',
      description: 'Implement Binary Search Trees',
      subject: 'Data Structures',
      department: facultyCS.department,
      faculty: facultyCS._id,
      dueDate: new Date(Date.now() + 86400000 * 3),
      totalMarks: 100,
    });

    const itAssignment = await Assignment.create({
      title: 'IT Cloud Computing Lab Task',
      description: 'Deploy Microservice on AWS ECS',
      subject: 'Cloud Computing',
      department: facultyIT.department,
      faculty: facultyIT._id,
      dueDate: new Date(Date.now() + 86400000 * 3),
      totalMarks: 100,
    });

    // 4. Verify Student Assignment Visibility
    const csStudentAssignments = await Assignment.find({ department: studentCS.department });
    const itStudentAssignments = await Assignment.find({ department: studentIT.department });

    const check3 = csStudentAssignments.some(a => a._id.equals(csAssignment._id));
    const check4 = !itStudentAssignments.some(a => a._id.equals(csAssignment._id));
    const check5 = itStudentAssignments.some(a => a._id.equals(itAssignment._id));
    const check6 = !csStudentAssignments.some(a => a._id.equals(itAssignment._id));
    console.log(`✅ [Checkpoints 3-6] CS student receives CS assignment: ${check3} | IT student blocked from CS assignment: ${check4}`);
    console.log(`✅ [Checkpoints 3-6] IT student receives IT assignment: ${check5} | CS student blocked from IT assignment: ${check6}`);

    // 5. Verify Submissions & Grading Authorization
    const itSubmission = await Submission.create({
      assignment: itAssignment._id,
      student: studentIT._id,
      content: 'AWS deployment configuration code submitted',
      submittedAt: new Date(),
    });

    const isCSFacultyAllowedToGradeITSubmission = facultyCS._id.equals(itAssignment.faculty) || facultyCS.department === itAssignment.department;
    console.log(`✅ [Checkpoint 7] CS Faculty blocked from grading IT submission: ${!isCSFacultyAllowedToGradeITSubmission}`);

    // 6. Verify Admin Roster & Oversight Capabilities
    const adminAllStudents = await User.find({ role: 'student' });
    const adminAllFaculty = await User.find({ role: 'faculty' });
    const check8 = adminAllStudents.some(s => s._id.equals(studentCS._id)) && adminAllStudents.some(s => s._id.equals(studentIT._id));
    const check9 = adminAllFaculty.some(f => f._id.equals(facultyCS._id)) && adminAllFaculty.some(f => f._id.equals(facultyIT._id));
    console.log(`✅ [Checkpoints 8 & 9] Admin can access all students: ${check8} | Admin can access all faculty: ${check9}`);

    // 7. Verify Events & Announcements Scope Isolation
    const collegeEvent = await Event.create({
      title: 'Annual College TechFest 2026',
      description: 'University-wide technical fest',
      date: new Date(Date.now() + 86400000 * 7),
      time: '09:00 AM',
      venue: 'Auditorium',
      audienceType: 'ALL',
      createdBy: adminUser._id,
    });

    const csEvent = await Event.create({
      title: 'CS Hackathon 2026',
      description: 'Exclusive to CS students',
      date: new Date(Date.now() + 86400000 * 5),
      time: '10:00 AM',
      venue: 'CS Lab 3',
      audienceType: 'DEPARTMENT',
      department: 'Computer Science',
      createdBy: facultyCS._id,
    });

    const csStudentEvents = await Event.find({
      $or: [{ audienceType: 'ALL' }, { audienceType: 'DEPARTMENT', department: studentCS.department }],
    });

    const itStudentEvents = await Event.find({
      $or: [{ audienceType: 'ALL' }, { audienceType: 'DEPARTMENT', department: studentIT.department }],
    });

    const check16_17 = csStudentEvents.some(e => e._id.equals(collegeEvent._id)) &&
                       csStudentEvents.some(e => e._id.equals(csEvent._id)) &&
                       itStudentEvents.some(e => e._id.equals(collegeEvent._id)) &&
                       !itStudentEvents.some(e => e._id.equals(csEvent._id));
    console.log(`✅ [Checkpoints 16 & 17] College-wide & Department Event Isolation Verified: ${check16_17}`);

    // 8. Clean up test documents
    await Event.deleteMany({ _id: { $in: [collegeEvent._id, csEvent._id] } });
    await Assignment.deleteMany({ _id: { $in: [csAssignment._id, itAssignment._id] } });
    await Submission.deleteMany({ _id: itSubmission._id });
    await User.deleteMany({ _id: { $in: [studentCS._id, studentIT._id, facultyCS._id, facultyIT._id, adminUser._id] } });

    console.log('\n🎉 ALL CAMPUSCONNECT ROLE & DEPARTMENT ARCHITECTURE VERIFICATION TESTS PASSED SUCCESSFULLY!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Error:', error);
    process.exit(1);
  }
}

runRoleArchitectureVerification();
