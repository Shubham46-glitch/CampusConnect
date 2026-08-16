import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import AcademicClass from '../models/AcademicClass.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import generateToken from '../utils/generateToken.js';
import { createNotification } from './notificationController.js';

// @desc    Register a new user (Student, Faculty, or Admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, className, academicClass, rollNumber, employeeId } = req.body;

    // 1. Input presence validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Email format regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // 4. Password length check
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // 5. Check role validity
    const allowedRoles = ['student', 'faculty', 'admin'];
    const userRole = role ? role.toLowerCase() : 'student';
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Role-specific field validation & Department / AcademicClass resolution
    let deptDoc = null;
    let classDoc = null;

    if (userRole === 'student') {
      if (!department || !department.trim()) {
        return res.status(400).json({ message: 'Department is required for Student registration' });
      }
      const classInput = className || academicClass || req.body.class;
      if (!classInput || !String(classInput).trim()) {
        return res.status(400).json({ message: 'Class / Division is required for Student registration' });
      }
      if (!rollNumber || !rollNumber.trim()) {
        return res.status(400).json({ message: 'Roll Number is required for Student registration' });
      }

      // Resolve Department Document
      if (mongoose.Types.ObjectId.isValid(department)) {
        deptDoc = await Department.findById(department);
      }
      if (!deptDoc) {
        deptDoc = await Department.findOne({
          $or: [
            { name: new RegExp(`^${department.trim()}$`, 'i') },
            { code: new RegExp(`^${department.trim()}$`, 'i') },
          ],
        });
      }
      if (!deptDoc) {
        const codeStr = String(department.trim()).split(' ').map(w => w[0]).join('').toUpperCase();
        deptDoc = await Department.create({
          name: department.trim(),
          code: codeStr,
          description: `${department.trim()} Department`,
        });
      }

      // Resolve AcademicClass Document
      if (mongoose.Types.ObjectId.isValid(classInput)) {
        classDoc = await AcademicClass.findById(classInput);
      }
      if (!classDoc) {
        classDoc = await AcademicClass.findOne({
          name: String(classInput).trim(),
          department: deptDoc._id,
        });
      }
      if (!classDoc) {
        classDoc = await AcademicClass.create({
          name: String(classInput).trim(),
          department: deptDoc._id,
          year: 'Second Year',
          semester: 3,
        });
      }
    } else if (userRole === 'faculty') {
      if (!department || !department.trim()) {
        return res.status(400).json({ message: 'Department is required for Faculty registration' });
      }
      if (!employeeId || !employeeId.trim()) {
        return res.status(400).json({ message: 'Employee ID is required for Faculty registration' });
      }

      // Resolve Department Document
      if (mongoose.Types.ObjectId.isValid(department)) {
        deptDoc = await Department.findById(department);
      }
      if (!deptDoc) {
        deptDoc = await Department.findOne({
          $or: [
            { name: new RegExp(`^${department.trim()}$`, 'i') },
            { code: new RegExp(`^${department.trim()}$`, 'i') },
          ],
        });
      }
      if (!deptDoc) {
        const codePrefix = String(department).split(' ').map((w) => w[0]).join('').toUpperCase();
        deptDoc = await Department.create({
          name: department.trim(),
          code: codePrefix,
          description: `${department.trim()} Department`,
        });
      }
    } else if (userRole === 'admin') {
      if (!employeeId || !employeeId.trim()) {
        return res.status(400).json({ message: 'Employee/Admin ID is required for Administrator registration' });
      }
    }

    // 6. Check duplicate user email
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // 7. Create user in MongoDB Atlas
    const targetDepartmentName = deptDoc ? deptDoc.name : (department ? department.trim() : '');
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      department: targetDepartmentName,
      profileInfo: {
        rollNumber: rollNumber ? rollNumber.trim() : '',
        employeeId: employeeId ? employeeId.trim() : '',
      },
    });

    if (user) {
      // Create StudentEnrollment record for student role
      if (userRole === 'student' && classDoc && deptDoc) {
        await StudentEnrollment.create({
          student: user._id,
          academicClass: classDoc._id,
          department: deptDoc._id,
          rollNumber: rollNumber ? rollNumber.trim() : '',
          status: 'active',
        });
      }

      // Notify admins about new user registration
      const admins = await User.find({ role: 'admin' }).select('_id');
      const isStudent = user.role === 'student';
      const isFaculty = user.role === 'faculty';
      const notifTitle = isStudent
        ? 'New Student Registered'
        : isFaculty
        ? 'New Faculty Registered'
        : 'New User Registered';
      const notifMsg = isStudent
        ? `A new student, "${user.name}", has registered on CampusConnect.`
        : isFaculty
        ? `A new faculty member, "${user.name}", has registered on CampusConnect.`
        : `A new user, "${user.name}", has registered on CampusConnect.`;

      for (const admin of admins) {
        if (admin._id.toString() !== user._id.toString()) {
          await createNotification({
            recipient: admin._id,
            title: notifTitle,
            message: notifMsg,
            type: 'system',
            relatedId: user._id,
            relatedType: 'User',
          });
        }
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileInfo: user.profileInfo,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Input presence validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user in MongoDB Atlas
    const user = await User.findOne({ email: normalizedEmail });

    // 4. Verify user exists and compare bcrypt password
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileInfo: user.profileInfo,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/profile or GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update currently authenticated user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, department, rollNumber, employeeId } = req.body;

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (department && department.trim()) {
      user.department = department.trim();
    }

    if (!user.profileInfo) {
      user.profileInfo = {};
    }

    if (rollNumber !== undefined) {
      user.profileInfo.rollNumber = rollNumber.trim();
    }

    if (employeeId !== undefined) {
      user.profileInfo.employeeId = employeeId.trim();
    }

    // Explicit security check: Role and Email cannot be modified via profile update
    // user.role and user.email remain unchanged

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      profileInfo: updatedUser.profileInfo,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (error) {
    next(error);
  }
};
