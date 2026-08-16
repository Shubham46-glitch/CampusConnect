import connectDB from './config/db.js';
import User from './models/User.js';
import Department from './models/Department.js';
import AcademicClass from './models/AcademicClass.js';
import { DEPARTMENTS } from './constants/departments.js';

const runCleanAndReseed = async () => {
  try {
    await connectDB();
    console.log('[CleanDB] Connected to MongoDB...');

    const deptMapping = {
      'Computer Engineering': 'Computer Science',
      'Electronics & Telecommunication': 'Electronics & Computer Science',
      'Mechanical Engineering': 'Information Technology',
      'Civil Engineering': 'Information Technology',
    };

    for (const [oldDept, newDept] of Object.entries(deptMapping)) {
      const res = await User.updateMany({ department: oldDept }, { $set: { department: newDept } });
      console.log(`[CleanDB] Migrated "${oldDept}" -> "${newDept}": ${res.modifiedCount} users updated.`);
    }

    // Delete obsolete Department documents not in DEPARTMENTS
    const deleteRes = await Department.deleteMany({ name: { $nin: DEPARTMENTS } });
    console.log(`[CleanDB] Deleted ${deleteRes.deletedCount} obsolete Department documents.`);

    // Delete academic classes not belonging to valid departments
    const validDepts = await Department.find({ name: { $in: DEPARTMENTS } });
    const validDeptIds = validDepts.map((d) => d._id);
    const classDeleteRes = await AcademicClass.deleteMany({ department: { $nin: validDeptIds } });
    console.log(`[CleanDB] Deleted ${classDeleteRes.deletedCount} obsolete AcademicClass documents.`);

    console.log('[CleanDB] Database cleanup complete.\n');
    process.exit(0);
  } catch (err) {
    console.error('[CleanDB Error]:', err.message);
    process.exit(1);
  }
};

runCleanAndReseed();
