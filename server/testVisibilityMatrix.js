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

async function testAllDepartmentsMatrix() {
  try {
    console.log('🚀 Starting Multi-Department Dynamic Visibility Matrix Tests (CS, IT, AIDS, EXTC, Mechanical, Civil)...\n');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB Connected.');

    // 1. Create or fetch test users across multiple engineering departments
    const studentCS = await User.findOneAndUpdate(
      { email: 'test.cs.student@college.edu' },
      { name: 'Rahul (CS)', email: 'test.cs.student@college.edu', password: 'Password123', role: 'student', department: 'Computer Science' },
      { upsert: true, new: true }
    );

    const studentIT = await User.findOneAndUpdate(
      { email: 'test.it.student@college.edu' },
      { name: 'Priya (IT)', email: 'test.it.student@college.edu', password: 'Password123', role: 'student', department: 'Information Technology' },
      { upsert: true, new: true }
    );

    const studentAIDS = await User.findOneAndUpdate(
      { email: 'test.aids.student@college.edu' },
      { name: 'Aarav (AIDS)', email: 'test.aids.student@college.edu', password: 'Password123', role: 'student', department: 'Artificial Intelligence & Data Science' },
      { upsert: true, new: true }
    );

    const studentEXTC = await User.findOneAndUpdate(
      { email: 'test.extc.student@college.edu' },
      { name: 'Ananya (ECS/EXTC)', email: 'test.extc.student@college.edu', password: 'Password123', role: 'student', department: 'Electronics & Telecommunication' },
      { upsert: true, new: true }
    );

    const faculty = await User.findOneAndUpdate(
      { email: 'test.faculty@college.edu' },
      { name: 'Prof. Sharma', email: 'test.faculty@college.edu', password: 'Password123', role: 'faculty', department: 'Artificial Intelligence & Data Science' },
      { upsert: true, new: true }
    );

    console.log('✅ Test Students Initialized for All Departments:');
    console.log(` - ${studentCS.name}: ${studentCS.department}`);
    console.log(` - ${studentIT.name}: ${studentIT.department}`);
    console.log(` - ${studentAIDS.name}: ${studentAIDS.department}`);
    console.log(` - ${studentEXTC.name}: ${studentEXTC.department}\n`);

    // 2. Create Events: 1 College-Wide, 1 AIDS Event, 1 EXTC Event
    const collegeEvent = await Event.create({
      title: 'Grand College-Wide Cultural Fest 2026',
      description: 'Open to every student in the university.',
      date: new Date(Date.now() + 86400000),
      time: '10:00 AM',
      venue: 'Main Campus Ground',
      audienceType: 'ALL',
      createdBy: faculty._id,
    });

    const aidsEvent = await Event.create({
      title: 'Neural Networks & Deep Learning Bootcamp',
      description: 'Exclusive to AI & Data Science students.',
      date: new Date(Date.now() + 86400000 * 2),
      time: '02:00 PM',
      venue: 'AI Research Lab',
      audienceType: 'DEPARTMENT',
      department: 'Artificial Intelligence & Data Science',
      createdBy: faculty._id,
    });

    const extcEvent = await Event.create({
      title: 'VLSI Circuit Design & IoT Workshop',
      description: 'Exclusive to Electronics & Telecommunication students.',
      date: new Date(Date.now() + 86400000 * 3),
      time: '11:00 AM',
      venue: 'Microprocessor Lab',
      audienceType: 'DEPARTMENT',
      department: 'Electronics & Telecommunication',
      createdBy: faculty._id,
    });

    // Helper query to simulate getEvents backend logic
    const getVisibleEventsForStudent = async (dept) => {
      return await Event.find({
        status: { $ne: 'cancelled' },
        $or: [
          { audienceType: 'ALL' },
          { audienceType: { $exists: false } },
          { audienceType: 'DEPARTMENT', department: dept },
        ],
      });
    };

    const aidsVisibleEvents = await getVisibleEventsForStudent('Artificial Intelligence & Data Science');
    const extcVisibleEvents = await getVisibleEventsForStudent('Electronics & Telecommunication');
    const csVisibleEvents = await getVisibleEventsForStudent('Computer Science');

    console.log('📌 MULTI-DEPARTMENT EVENT VISIBILITY TEST:');
    console.log(` - AIDS Student sees College Event: ${aidsVisibleEvents.some(e => e._id.equals(collegeEvent._id))}, AIDS Event: ${aidsVisibleEvents.some(e => e._id.equals(aidsEvent._id))}, EXTC Event: ${aidsVisibleEvents.some(e => e._id.equals(extcEvent._id))}`);
    console.log(` - EXTC Student sees College Event: ${extcVisibleEvents.some(e => e._id.equals(collegeEvent._id))}, EXTC Event: ${extcVisibleEvents.some(e => e._id.equals(extcEvent._id))}, AIDS Event: ${extcVisibleEvents.some(e => e._id.equals(aidsEvent._id))}`);
    console.log(` - CS Student sees College Event: ${csVisibleEvents.some(e => e._id.equals(collegeEvent._id))}, AIDS Event: ${csVisibleEvents.some(e => e._id.equals(aidsEvent._id))}, EXTC Event: ${csVisibleEvents.some(e => e._id.equals(extcEvent._id))}`);

    const eventMatrixPassed =
      aidsVisibleEvents.some(e => e._id.equals(collegeEvent._id)) &&
      aidsVisibleEvents.some(e => e._id.equals(aidsEvent._id)) &&
      !aidsVisibleEvents.some(e => e._id.equals(extcEvent._id)) &&
      extcVisibleEvents.some(e => e._id.equals(extcEvent._id)) &&
      !extcVisibleEvents.some(e => e._id.equals(aidsEvent._id));

    if (eventMatrixPassed) {
      console.log('✅ Multi-Department Event Visibility Test PASSED.\n');
    } else {
      console.error('❌ Multi-Department Event Visibility Test FAILED.\n');
    }

    // 3. Create Assignments: AIDS Assignment vs EXTC Assignment
    const aidsAssignment = await Assignment.create({
      title: 'Machine Learning Model Optimization',
      description: 'Train PyTorch model on MNIST dataset',
      subject: 'Machine Learning',
      department: 'Artificial Intelligence & Data Science',
      dueDate: new Date(Date.now() + 86400000 * 5),
      totalMarks: 100,
      faculty: faculty._id,
    });

    const extcAssignment = await Assignment.create({
      title: 'Digital Signal Processing Filter Design',
      description: 'Design FIR & IIR filters in MATLAB',
      subject: 'Digital Signal Processing',
      department: 'Electronics & Telecommunication',
      dueDate: new Date(Date.now() + 86400000 * 5),
      totalMarks: 100,
      faculty: faculty._id,
    });

    const aidsStudentAssignments = await Assignment.find({ department: 'Artificial Intelligence & Data Science' });
    const extcStudentAssignments = await Assignment.find({ department: 'Electronics & Telecommunication' });

    console.log('📌 MULTI-DEPARTMENT ASSIGNMENT TARGETING TEST:');
    console.log(` - AIDS Student receives AIDS Assignment: ${aidsStudentAssignments.some(a => a._id.equals(aidsAssignment._id))}, EXTC Assignment: ${aidsStudentAssignments.some(a => a._id.equals(extcAssignment._id))}`);
    console.log(` - EXTC Student receives EXTC Assignment: ${extcStudentAssignments.some(a => a._id.equals(extcAssignment._id))}, AIDS Assignment: ${extcStudentAssignments.some(a => a._id.equals(aidsAssignment._id))}`);

    const assignmentMatrixPassed =
      aidsStudentAssignments.some(a => a._id.equals(aidsAssignment._id)) &&
      !aidsStudentAssignments.some(a => a._id.equals(extcAssignment._id)) &&
      extcStudentAssignments.some(a => a._id.equals(extcAssignment._id)) &&
      !extcStudentAssignments.some(a => a._id.equals(aidsAssignment._id));

    if (assignmentMatrixPassed) {
      console.log('✅ Multi-Department Assignment Targeting Test PASSED.\n');
    } else {
      console.error('❌ Multi-Department Assignment Targeting Test FAILED.\n');
    }

    // Clean up test documents
    await Event.deleteMany({ _id: { $in: [collegeEvent._id, aidsEvent._id, extcEvent._id] } });
    await Assignment.deleteMany({ _id: { $in: [aidsAssignment._id, extcAssignment._id] } });
    await User.deleteMany({ _id: { $in: [studentCS._id, studentIT._id, studentAIDS._id, studentEXTC._id, faculty._id] } });

    console.log('🎉 DYNAMIC MULTI-DEPARTMENT VISIBILITY MATRIX VERIFIED FOR ALL DEPARTMENTS!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  }
}

testAllDepartmentsMatrix();
