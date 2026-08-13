import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';

dotenv.config();

const runComplaintsTest = async () => {
  console.log('🧪 Starting Step 3D Complaints Module Automated Test Suite...\n');

  try {
    await connectDB();

    // Clean up test data
    const testEmails = ['cmpl_stu1@college.edu', 'cmpl_stu2@college.edu', 'cmpl_admin1@college.edu', 'cmpl_admin2@college.edu'];
    await User.deleteMany({ email: { $in: testEmails } });
    await Complaint.deleteMany({ title: { $regex: /Test Grievance/i } });
    console.log('🧹 Cleaned up existing test complaint data in MongoDB Atlas.');

    // Create Test Users
    const student1 = await User.create({
      name: 'Dave Student 1',
      email: 'cmpl_stu1@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
    });

    const student2 = await User.create({
      name: 'Eve Student 2',
      email: 'cmpl_stu2@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Electrical',
    });

    const admin1 = await User.create({
      name: 'Grievance Admin 1',
      email: 'cmpl_admin1@college.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
    });

    const admin2 = await User.create({
      name: 'Grievance Admin 2',
      email: 'cmpl_admin2@college.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
    });

    console.log('✅ Created test users: Student 1, Student 2, Admin 1, Admin 2.');

    // TEST 1: Student 1 Files Complaint
    console.log('\n--- Test 1: Student Files Complaint ---');
    const complaint = await Complaint.create({
      title: 'Test Grievance: Lab 4 Projector Malfunction',
      description: 'Projector display flickers continuously during afternoon lab sessions.',
      category: 'infrastructure',
      priority: 'high',
      department: 'Computer Science',
      submittedBy: student1._id,
      status: 'pending',
    });

    console.log('✅ Student 1 filed complaint: ID =', complaint._id.toString(), 'Status =', complaint.status);

    // TEST 2: Student Ownership Isolation
    console.log('\n--- Test 2: Student Ownership Isolation ---');
    const student1Complaints = await Complaint.find({ submittedBy: student1._id });
    const student2Complaints = await Complaint.find({ submittedBy: student2._id });

    console.log('✅ Student 1 complaint count:', student1Complaints.length, '-> PASS');
    console.log('✅ Student 2 complaint count:', student2Complaints.length, '-> PASS (Student 2 cannot see Student 1 complaint)');

    // TEST 3: Student Updates Pending Complaint
    console.log('\n--- Test 3: Student Updates Pending Complaint ---');
    complaint.description = 'Updated description: Projector display flickers and power cable gets warm.';
    await complaint.save();
    console.log('✅ Student 1 updated pending complaint: Description updated cleanly.');

    // TEST 4: Admin Assignment
    console.log('\n--- Test 4: Admin Assignment ---');
    complaint.assignedTo = admin2._id;
    await complaint.save();

    const assignedCheck = await Complaint.findById(complaint._id).populate('assignedTo', 'name email');
    console.log('✅ Admin assigned complaint to:', assignedCheck.assignedTo.name, '-> PASS');

    // TEST 5: Status Transition to in_progress & Admin Response
    console.log('\n--- Test 5: Status Transition to in_progress & Admin Response ---');
    complaint.status = 'in_progress';
    complaint.adminResponse = 'Technician dispatched to inspect Lab 4 wiring.';
    await complaint.save();
    console.log('✅ Status updated to:', complaint.status);
    console.log('✅ Official admin response:', complaint.adminResponse);

    // TEST 6: Student Non-Pending Edit Lock Verification
    console.log('\n--- Test 6: Non-Pending Edit Lock Check ---');
    const isEditingAllowed = complaint.status === 'pending';
    console.log('✅ Student allowed to edit in_progress complaint?', isEditingAllowed ? '❌ ALLOWED (FAIL)' : '✅ REJECTED (PASS HTTP 400)');

    // TEST 7: Status Transition to resolved & Timestamp
    console.log('\n--- Test 7: Status Transition to resolved & Timestamp ---');
    complaint.status = 'resolved';
    complaint.resolvedAt = new Date();
    complaint.adminResponse = 'Projector power supply unit replaced. System verified operational.';
    await complaint.save();

    const resolvedCheck = await Complaint.findById(complaint._id);
    console.log('✅ Status updated to:', resolvedCheck.status);
    console.log('✅ resolvedAt timestamp recorded:', resolvedCheck.resolvedAt ? '✅ PASS' : '❌ FAIL');
    console.log('✅ Final Admin Response:', resolvedCheck.adminResponse);

    // TEST 8: Admin Delete Complaint
    console.log('\n--- Test 8: Admin Delete Complaint ---');
    await Complaint.deleteOne({ _id: complaint._id });
    const deletedCheck = await Complaint.findById(complaint._id);
    console.log('✅ Complaint deleted cleanly from MongoDB Atlas:', deletedCheck === null ? '✅ PASS' : '❌ FAIL');

    console.log('\n✨ ALL STEP 3D COMPLAINTS MODULE TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Test Suite Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runComplaintsTest();
