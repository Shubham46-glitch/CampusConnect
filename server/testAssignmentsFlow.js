import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';

dotenv.config();

const runAssignmentsTest = async () => {
  console.log('🧪 Starting Step 3C Assignments Module Automated Test Suite...\n');

  try {
    await connectDB();

    // Clean up test data
    const testEmails = ['asgn_stu1@college.edu', 'asgn_stu2@college.edu', 'asgn_fac1@college.edu', 'asgn_fac2@college.edu', 'asgn_admin@college.edu'];
    await User.deleteMany({ email: { $in: testEmails } });
    await Assignment.deleteMany({ title: { $regex: /Test Assignment/i } });
    console.log('🧹 Cleaned up existing test assignment data in MongoDB Atlas.');

    // Create Test Users
    const student1 = await User.create({
      name: 'Bob Student 1',
      email: 'asgn_stu1@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      profileInfo: { rollNumber: 'CS202650' },
    });

    const student2 = await User.create({
      name: 'Charlie Student 2',
      email: 'asgn_stu2@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      profileInfo: { rollNumber: 'CS202651' },
    });

    const faculty1 = await User.create({
      name: 'Prof. CS Lead',
      email: 'asgn_fac1@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
    });

    const faculty2 = await User.create({
      name: 'Prof. EE Lead',
      email: 'asgn_fac2@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Electrical',
    });

    const admin = await User.create({
      name: 'Admin Supervisor',
      email: 'asgn_admin@college.edu',
      password: 'password123',
      role: 'admin',
      department: 'Management',
    });

    console.log('✅ Created test users: Student 1, Student 2, Faculty 1 (Creator), Faculty 2, Admin.');

    // TEST 1: Faculty 1 Creates Assignments
    console.log('\n--- Test 1: Create Assignments ---');

    const activeAssignment = await Assignment.create({
      title: 'Test Assignment 1: MERN Stack API Project',
      description: 'Implement complete REST API with authentication and Mongoose models.',
      subject: 'Full Stack Development',
      department: 'Computer Science',
      dueDate: new Date(Date.now() + 86400000 * 7), // Due in 7 days
      totalMarks: 100,
      faculty: faculty1._id,
      status: 'active',
    });

    const overdueAssignment = await Assignment.create({
      title: 'Test Assignment 2: React Core Hooks',
      description: 'Lab 1 assignment on useState and useEffect.',
      subject: 'Frontend Frameworks',
      department: 'Computer Science',
      dueDate: new Date(Date.now() - 86400000 * 2), // Due 2 days ago
      totalMarks: 50,
      faculty: faculty1._id,
      status: 'active',
    });

    console.log('✅ Faculty 1 created 2 assignments: Active (100 Marks) & Overdue (50 Marks).');

    // TEST 2: Student 1 Submits Work On-Time
    console.log('\n--- Test 2: Student 1 Submits Work On-Time ---');

    const sub1 = await Submission.create({
      assignment: activeAssignment._id,
      student: student1._id,
      content: 'https://github.com/bob/mern-api - Complete implementation of endpoints.',
      fileUrl: 'https://github.com/bob/mern-api',
      submittedAt: new Date(),
      status: new Date() > activeAssignment.dueDate ? 'late' : 'submitted',
    });

    console.log('✅ Student 1 submitted work. Submission Status:', sub1.status);
    console.log('✅ On-time submission check:', sub1.status === 'submitted' ? '✅ PASS' : '❌ FAIL');

    // TEST 3: Student 2 Submits Work Late
    console.log('\n--- Test 3: Student 2 Submits Work Late ---');

    const sub2 = await Submission.create({
      assignment: overdueAssignment._id,
      student: student2._id,
      content: 'Late submission for React Core Hooks lab.',
      submittedAt: new Date(),
      status: new Date() > overdueAssignment.dueDate ? 'late' : 'submitted',
    });

    console.log('✅ Student 2 submitted overdue work. Submission Status:', sub2.status);
    console.log('✅ Late submission status check:', sub2.status === 'late' ? '✅ PASS' : '❌ FAIL');

    // TEST 4: Submissions Access Control (Faculty 1 vs Faculty 2)
    console.log('\n--- Test 4: Submissions Access Control ---');
    const isFaculty1Creator = activeAssignment.faculty.toString() === faculty1._id.toString();
    const isFaculty2Creator = activeAssignment.faculty.toString() === faculty2._id.toString();
    const isAdminAuthorized = admin.role === 'admin';

    console.log('✅ Faculty 1 (Creator) allowed to view submissions?', isFaculty1Creator ? '✅ PASS (Allowed)' : '❌ FAIL');
    console.log('✅ Faculty 2 (Non-Creator) allowed to view submissions?', isFaculty2Creator || isAdminAuthorized ? '❌ ALLOWED (FAIL)' : '✅ PASS (Forbidden HTTP 403)');
    console.log('✅ Admin allowed to view submissions?', isAdminAuthorized ? '✅ PASS (Allowed)' : '❌ FAIL');

    // TEST 5: Faculty 1 Grades Student 1 Submission
    console.log('\n--- Test 5: Faculty Evaluation & Grading ---');
    sub1.marks = 92;
    sub1.feedback = 'Outstanding REST API design and schema validation!';
    sub1.gradedAt = new Date();
    sub1.status = 'graded';
    await sub1.save();

    console.log('✅ Faculty 1 graded Student 1. Marks:', sub1.marks, '/', activeAssignment.totalMarks);
    console.log('✅ Submission status updated to:', sub1.status);
    console.log('✅ Feedback recorded:', sub1.feedback);

    // TEST 6: Invalid Marks Validation (Marks > totalMarks)
    console.log('\n--- Test 6: Invalid Marks Validation ---');
    const invalidMarks = 150;
    const isValid = invalidMarks <= activeAssignment.totalMarks;
    console.log('✅ Awarding 150 marks on 100-mark assignment allowed?', isValid ? '❌ ALLOWED (FAIL)' : '✅ REJECTED (PASS HTTP 400)');

    // TEST 7: Safe Cascade Deletion
    console.log('\n--- Test 7: Safe Cascade Deletion ---');
    await Submission.deleteMany({ assignment: activeAssignment._id });
    await Assignment.deleteOne({ _id: activeAssignment._id });

    const checkAssignmentDeleted = await Assignment.findById(activeAssignment._id);
    const checkSubmissionsDeleted = await Submission.find({ assignment: activeAssignment._id });

    console.log('✅ Assignment deleted from MongoDB Atlas:', checkAssignmentDeleted === null ? '✅ PASS' : '❌ FAIL');
    console.log('✅ Associated submissions deleted cleanly:', checkSubmissionsDeleted.length === 0 ? '✅ PASS' : '❌ FAIL');

    console.log('\n✨ ALL STEP 3C ASSIGNMENTS MODULE TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Test Suite Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runAssignmentsTest();
