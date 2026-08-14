import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import Department from './models/Department.js';
import AcademicClass from './models/AcademicClass.js';
import User from './models/User.js';
import StudentEnrollment from './models/StudentEnrollment.js';
import { DEPARTMENTS } from './constants/departments.js';
import bcrypt from 'bcryptjs';

// Department Shortcode Mapping
const DEPT_CODES = {
  'Information Technology': 'IT',
  'Computer Engineering': 'COMPS',
  'Computer Science': 'CS',
  'Artificial Intelligence & Machine Learning': 'AIML',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Electronics & Computer Science': 'ECS',
  'Electronics & Telecommunication': 'EXTC',
  'Mechanical Engineering': 'MECH',
  'Civil Engineering': 'CIVIL',
};

// Rich list of realistic Maharashtrian & Indian Student Names
const MAHARASHTRIAN_NAMES = [
  'Aditya Patil',
  'Atharva Jadhav',
  'Omkar Shinde',
  'Prathamesh Pawar',
  'Rohan Deshmukh',
  'Siddhant Kulkarni',
  'Yash Kadam',
  'Saurabh Chavan',
  'Tejas Bhosale',
  'Kunal Gaikwad',
  'Nikhil Salunkhe',
  'Vedant Naik',
  'Snehal Patil',
  'Sayali Deshmukh',
  'Prachi Jadhav',
  'Sakshi Shinde',
  'Riya More',
  'Aishwarya Kulkarni',
  'Mitali Joshi',
  'Rutuja Pawar',
  'Aarav Joshi',
  'Anaya Kadam',
  'Devansh Shinde',
  'Isha Pawar',
  'Kabir Deshmukh',
  'Meera Kulkarni',
  'Parth Patil',
  'Radhika Bhosale',
  'Sarthak Gaikwad',
  'Tanvi Chavan',
  'Varun Salunkhe',
  'Gauri Naik',
  'Swapnil Joshi',
  'Pooja Kadam',
  'Harsh Shinde',
  'Neha Pawar',
  'Vicky Deshmukh',
  'Divya Kulkarni',
  'Akash Patil',
  'Shruti Bhosale',
  'Pranav Gaikwad',
  'Komal Chavan',
  'Suraj Salunkhe',
  'Priya Naik',
  'Chinmay Bhat',
  'Tanmay Apte',
  'Shraddha Godbole',
  'Mandar Date',
  'Aniket Sane',
  'Bhavesh Sawant',
];

const getDeptCode = (name) => {
  if (DEPT_CODES[name]) return DEPT_CODES[name];
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const seedStudents = async () => {
  try {
    await connectDB();
    console.log('\nStarting CampusConnect Student Data Seeder...\n');

    // Pre-hash default password once for fast bulk creation
    const hashedPassword = await bcrypt.hash('Campus@123', 10);

    // 1. Gather all target departments (from DB, Users, and Constants)
    const dbDepts = await Department.find();
    const dbDeptNames = dbDepts.map((d) => d.name);
    const userDeptNames = await User.distinct('department', { role: 'student' });

    const allDeptNames = Array.from(
      new Set([...DEPARTMENTS, ...dbDeptNames, ...userDeptNames].filter(Boolean))
    );

    const summaryResults = [];

    for (const deptName of allDeptNames) {
      const deptCode = getDeptCode(deptName);

      // Ensure Department document exists
      let deptDoc = dbDepts.find((d) => d.name === deptName);
      if (!deptDoc) {
        deptDoc = await Department.create({
          name: deptName,
          code: deptCode,
          description: `${deptName} Department`,
        });
      }

      // Ensure Academic Divisions exist for Division 1 and Division 2
      const div1Name = `${deptCode}-D1`;
      const div2Name = `${deptCode}-D2`;

      let div1Class = await AcademicClass.findOne({ department: deptDoc._id, name: div1Name });
      if (!div1Class) {
        div1Class = await AcademicClass.create({
          name: div1Name,
          department: deptDoc._id,
          year: 'Second Year',
          semester: 3,
        });
      }

      let div2Class = await AcademicClass.findOne({ department: deptDoc._id, name: div2Name });
      if (!div2Class) {
        div2Class = await AcademicClass.create({
          name: div2Name,
          department: deptDoc._id,
          year: 'Second Year',
          semester: 3,
        });
      }

      // Helper function to seed division to exactly 20 students
      const seedDivisionToTarget = async (divClass, divCode) => {
        const existingEnrollments = await StudentEnrollment.find({
          academicClass: divClass._id,
        }).populate('student');

        let currentCount = existingEnrollments.length;
        const target = 20;

        if (currentCount < target) {
          const newUsersToCreate = [];
          const newEnrollmentsToCreate = [];

          for (let i = currentCount + 1; i <= target; i++) {
            const rollNum = `${divCode}-${String(i).padStart(2, '0')}`;
            const nameIndex = (i - 1 + deptName.length) % MAHARASHTRIAN_NAMES.length;
            const studentName = MAHARASHTRIAN_NAMES[nameIndex];
            const nameParts = studentName.toLowerCase().split(' ');
            const email = `${nameParts[0]}.${nameParts[1]}.${divCode.toLowerCase()}.${String(i).padStart(2, '0')}@campusconnect.demo`;

            // Check if user already exists by rollNumber or email
            let studentUser = await User.findOne({
              $or: [{ email }, { 'profileInfo.rollNumber': rollNum }],
            });

            if (!studentUser) {
              newUsersToCreate.push({
                name: studentName,
                email,
                password: hashedPassword,
                role: 'student',
                department: deptName,
                profileInfo: { rollNumber: rollNum },
              });
            } else {
              // Ensure enrollment record exists for pre-existing user
              let enrollment = await StudentEnrollment.findOne({ student: studentUser._id });
              if (!enrollment) {
                newEnrollmentsToCreate.push({
                  student: studentUser._id,
                  academicClass: divClass._id,
                  department: deptDoc._id,
                  rollNumber: rollNum,
                });
              }
            }
          }

          if (newUsersToCreate.length > 0) {
            const createdUsers = await User.insertMany(newUsersToCreate);
            createdUsers.forEach((u) => {
              newEnrollmentsToCreate.push({
                student: u._id,
                academicClass: divClass._id,
                department: deptDoc._id,
                rollNumber: u.profileInfo?.rollNumber || `${divCode}-01`,
              });
            });
          }

          if (newEnrollmentsToCreate.length > 0) {
            await StudentEnrollment.insertMany(newEnrollmentsToCreate);
          }

          const updatedEnrollments = await StudentEnrollment.find({ academicClass: divClass._id });
          currentCount = updatedEnrollments.length;
        }

        return currentCount;
      };

      const count1 = await seedDivisionToTarget(div1Class, `${deptCode}-D1`);
      const count2 = await seedDivisionToTarget(div2Class, `${deptCode}-D2`);

      summaryResults.push({
        deptName,
        div1Count: count1,
        div2Count: count2,
      });
    }

    // Print Terminal Summary Output
    console.log('\n====================================');
    console.log('  CampusConnect Student Seed');
    console.log('====================================\n');

    summaryResults.forEach((res) => {
      console.log(`${res.deptName}`);
      console.log(`  Division 1: ${res.div1Count} students`);
      console.log(`  Division 2: ${res.div2Count} students\n`);
    });

    console.log('------------------------------------');
    console.log('Student seeding completed successfully.\n');

    process.exit(0);
  } catch (err) {
    console.error('Error running student seeder:', err);
    process.exit(1);
  }
};

seedStudents();
