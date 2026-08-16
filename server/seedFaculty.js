import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import User from './models/User.js';
import Department from './models/Department.js';
import { DEPARTMENTS } from './constants/departments.js';
import bcrypt from 'bcryptjs';

const FACULTY_DATA = {
  'Computer Science': [
    { name: 'Dr. Rajesh Sharma', designation: 'Professor & HOD' },
    { name: 'Prof. Priya Kulkarni', designation: 'Associate Professor' },
    { name: 'Dr. Amit Deshmukh', designation: 'Assistant Professor' },
    { name: 'Prof. Sneha Patil', designation: 'Assistant Professor' },
    { name: 'Dr. Vikram Joshi', designation: 'Assistant Professor' },
  ],
  'Electronics & Computer Science': [
    { name: 'Dr. Suresh Gaikwad', designation: 'Professor & HOD' },
    { name: 'Prof. Anjali Pawar', designation: 'Associate Professor' },
    { name: 'Dr. Nitin Shinde', designation: 'Assistant Professor' },
    { name: 'Prof. Radhika Chavan', designation: 'Assistant Professor' },
    { name: 'Dr. Mahesh Bhosale', designation: 'Assistant Professor' },
  ],
  'Information Technology': [
    { name: 'Dr. Anand Kulkarni', designation: 'Professor & HOD' },
    { name: 'Prof. Smita Jadhav', designation: 'Associate Professor' },
    { name: 'Dr. Prakash Salunkhe', designation: 'Assistant Professor' },
    { name: 'Prof. Deepa Naik', designation: 'Assistant Professor' },
    { name: 'Dr. Sameer Bhat', designation: 'Assistant Professor' },
  ],
  'Artificial Intelligence & Data Science': [
    { name: 'Dr. Sanjay Date', designation: 'Professor & HOD' },
    { name: 'Prof. Neha Sawant', designation: 'Associate Professor' },
    { name: 'Dr. Rahul Apte', designation: 'Assistant Professor' },
    { name: 'Prof. Kavita Godbole', designation: 'Assistant Professor' },
    { name: 'Dr. Milind Sane', designation: 'Assistant Professor' },
  ],
  'Artificial Intelligence & Machine Learning': [
    { name: 'Dr. Harish Patil', designation: 'Professor & HOD' },
    { name: 'Prof. Sunita Shinde', designation: 'Associate Professor' },
    { name: 'Dr. Rohit Pawar', designation: 'Assistant Professor' },
    { name: 'Prof. Meenal Kadam', designation: 'Assistant Professor' },
    { name: 'Dr. Ashish Chavan', designation: 'Assistant Professor' },
  ],
};

const DEPT_CODES = {
  'Computer Science': 'CS',
  'Electronics & Computer Science': 'ECS',
  'Information Technology': 'IT',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Artificial Intelligence & Machine Learning': 'AIML',
};

const seedFaculty = async () => {
  try {
    await connectDB();
    console.log('\n====================================');
    console.log('  CampusConnect Faculty Data Seeder');
    console.log('====================================\n');

    const hashedPassword = await bcrypt.hash('Faculty@123', 10);

    for (const deptName of DEPARTMENTS) {
      const code = DEPT_CODES[deptName] || 'DEPT';
      const facultyList = FACULTY_DATA[deptName] || [];

      // Ensure Department doc exists
      let deptDoc = await Department.findOne({ name: new RegExp(`^${deptName}$`, 'i') });
      if (!deptDoc) {
        deptDoc = await Department.create({
          name: deptName,
          code,
          description: `${deptName} Department`,
        });
      }

      console.log(`Department: ${deptName} (${code})`);

      for (let i = 0; i < facultyList.length; i++) {
        const item = facultyList[i];
        const idxStr = String(i + 1).padStart(2, '0');
        const empId = `FAC-${code}-${idxStr}`;
        const cleanNameParts = item.name.replace(/dr\.|prof\./gi, '').trim().toLowerCase().split(' ');
        const email = `prof.${cleanNameParts[0]}.${code.toLowerCase()}${idxStr}@campusconnect.demo`;

        let userDoc = await User.findOne({
          $or: [{ email }, { 'profileInfo.employeeId': empId }],
        });

        if (!userDoc) {
          userDoc = await User.create({
            name: item.name,
            email,
            password: hashedPassword,
            role: 'faculty',
            department: deptName,
            status: 'active',
            profileInfo: {
              employeeId: empId,
              designation: item.designation,
            },
          });
          console.log(`  + Created Faculty: ${userDoc.name} | Email: ${userDoc.email} | EmpID: ${empId}`);
        } else {
          // Ensure correct department and profile info
          userDoc.department = deptName;
          userDoc.role = 'faculty';
          userDoc.status = 'active';
          userDoc.profileInfo = {
            employeeId: empId,
            designation: item.designation,
          };
          await userDoc.save();
          console.log(`  = Verified Faculty: ${userDoc.name} | Email: ${userDoc.email} | EmpID: ${empId}`);
        }
      }
      console.log('');
    }

    console.log('------------------------------------');
    console.log('Faculty seeding completed successfully!');
    console.log('All faculty accounts password set to: Faculty@123');
    console.log('------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding faculty:', err);
    process.exit(1);
  }
};

seedFaculty();
