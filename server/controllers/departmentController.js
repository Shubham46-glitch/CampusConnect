import User from '../models/User.js';
import { DEPARTMENTS } from '../constants/departments.js';

// @desc    Get all departments with live student & faculty counts
// @route   GET /api/departments
// @access  Private (All authenticated users)
export const getDepartments = async (req, res, next) => {
  try {
    // 1. Fetch user counts per department from database
    const counts = await User.aggregate([
      {
        $group: {
          _id: '$department',
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          faculty: { $sum: { $cond: [{ $eq: ['$role', 'faculty'] }, 1, 0] } },
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map();
    counts.forEach((item) => {
      if (item._id) {
        countMap.set(item._id, item);
      }
    });

    // 2. Build full department list combining predefined list and DB counts
    const deptList = DEPARTMENTS.map((deptName) => {
      const data = countMap.get(deptName) || { students: 0, faculty: 0, totalUsers: 0 };
      return {
        name: deptName,
        studentsCount: data.students,
        facultyCount: data.faculty,
        totalUsers: data.totalUsers,
      };
    });

    res.json(deptList);
  } catch (error) {
    next(error);
  }
};
