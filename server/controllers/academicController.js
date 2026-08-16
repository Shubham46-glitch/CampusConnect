import mongoose from 'mongoose';
import Department from '../models/Department.js';
import AcademicClass from '../models/AcademicClass.js';
import Subject from '../models/Subject.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import User from '../models/User.js';

const DEPT_CODES = {
  'Computer Science': 'CS',
  'Electronics & Computer Science': 'ECS',
  'Information Technology': 'IT',
  'Artificial Intelligence & Data Science': 'AIDS',
  'Artificial Intelligence & Machine Learning': 'AIML',
};

const escapeRegex = (text) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');


// ==================== DEPARTMENTS ====================

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({ message: 'Department name or code already exists' });
    }
    const department = await Department.create({ name, code, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ACADEMIC CLASSES ====================

export const getAcademicClasses = async (req, res) => {
  try {
    const query = {};
    if (req.query.department) {
      query.department = req.query.department;
    }
    const classes = await AcademicClass.find(query)
      .populate('department', 'name code')
      .sort({ year: 1, semester: 1, name: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get classes scoped strictly to logged-in faculty's department
export const getFacultyDepartmentClasses = async (req, res) => {
  try {
    const userDept = req.query.department || req.user.department;
    if (!userDept && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Faculty department is not set' });
    }

    let deptDoc = null;
    if (userDept) {
      if (mongoose.Types.ObjectId.isValid(userDept)) {
        deptDoc = await Department.findById(userDept);
      }
      if (!deptDoc) {
        // EXACT match by department name or code using anchored regex (^...$)
        deptDoc = await Department.findOne({
          $or: [
            { name: new RegExp(`^${userDept.trim()}$`, 'i') },
            { code: new RegExp(`^${userDept.trim()}$`, 'i') },
          ],
        });
      }
    }

    let classes = [];
    if (deptDoc) {
      classes = await AcademicClass.find({ department: deptDoc._id })
        .populate('department', 'name code')
        .sort({ name: 1 });
    }

    // Fallback 1: If no classes found by exact department _id, find matching department documents
    if (classes.length === 0 && userDept) {
      const deptCode = String(userDept).substring(0, 5).toUpperCase();
      const matchingDepts = await Department.find({
        $or: [
          { name: new RegExp(`^${userDept.trim()}$`, 'i') },
          { code: new RegExp(`^${deptCode}$`, 'i') },
        ],
      });
      if (matchingDepts.length > 0) {
        classes = await AcademicClass.find({
          department: { $in: matchingDepts.map((d) => d._id) },
        })
          .populate('department', 'name code')
          .sort({ name: 1 });
      }
    }

    // Fallback 3: If classes array is still empty, auto-create Division 1 & Division 2 classes for this department
    if (classes.length === 0 && userDept) {
      const deptCode = DEPT_CODES[userDept] || String(userDept).split(' ').map((w) => w[0]).join('').toUpperCase();

      if (!deptDoc) {
        deptDoc = await Department.create({
          name: userDept,
          code: deptCode,
          description: `${userDept} Department`,
        });
      }

      const div1Name = `${deptCode}-D1`;
      const div2Name = `${deptCode}-D2`;

      await AcademicClass.create([
        { name: div1Name, department: deptDoc._id, year: 'Second Year', semester: 3 },
        { name: div2Name, department: deptDoc._id, year: 'Second Year', semester: 3 },
      ]);

      classes = await AcademicClass.find({ department: deptDoc._id })
        .populate('department', 'name code')
        .sort({ name: 1 });
    }

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAcademicClass = async (req, res) => {
  try {
    const { name, department, year, semester } = req.body;
    const academicClass = await AcademicClass.create({ name, department, year, semester });
    const populated = await AcademicClass.findById(academicClass._id).populate('department', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAcademicClass = async (req, res) => {
  try {
    const { id } = req.params;
    const academicClass = await AcademicClass.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('department', 'name code');
    if (!academicClass) return res.status(404).json({ message: 'Academic Class not found' });
    res.json(academicClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAcademicClass = async (req, res) => {
  try {
    const { id } = req.params;
    const academicClass = await AcademicClass.findByIdAndDelete(id);
    if (!academicClass) return res.status(404).json({ message: 'Academic Class not found' });
    res.json({ message: 'Academic Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== SUBJECTS ====================

export const getSubjects = async (req, res) => {
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.academicClass) query.academicClass = req.query.academicClass;

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('academicClass', 'name year semester')
      .sort({ code: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code, department, academicClass, semester, credits } = req.body;
    const subject = await Subject.create({
      name,
      code,
      department,
      academicClass,
      semester: semester || 4,
      credits: credits || 4,
      faculty: req.user._id,
    });
    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate('academicClass', 'name year semester');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Faculty-created subject handler with strict department authorization check
export const createSubjectByFaculty = async (req, res) => {
  try {
    const { name, code, className, semester, credits } = req.body;
    const facultyId = req.user._id;

    // Force department to logged-in faculty's department for faculty role
    const departmentName = req.user.role === 'faculty' && req.user.department
      ? req.user.department
      : (req.body.departmentName || req.body.department);

    if (!name || !code || !departmentName || (!className && !req.body.academicClass)) {
      return res.status(400).json({ message: 'Subject name, code, department, and class are required' });
    }

    // 1. Resolve Department strictly via exact name or code match
    let deptDoc = null;
    if (mongoose.Types.ObjectId.isValid(departmentName)) {
      deptDoc = await Department.findById(departmentName);
    }
    if (!deptDoc) {
      deptDoc = await Department.findOne({
        $or: [
          { name: String(departmentName).trim() },
          { code: String(departmentName).trim().toUpperCase() },
        ],
      });
    }
    if (!deptDoc) {
      deptDoc = await Department.create({
        name: departmentName,
        code: String(departmentName).substring(0, 5).toUpperCase(),
        description: `Department of ${departmentName}`,
      });
    }

    // 2. Resolve Academic Class
    let classDoc = null;
    const classInput = className || req.body.academicClass;

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
        semester: Number(semester) || 4,
      });
    }

    // 3. Backend Department Authorization Enforcement
    if (req.user.role === 'faculty' && classDoc.department.toString() !== deptDoc._id.toString()) {
      return res.status(403).json({
        message: `Forbidden: You belong to ${req.user.department} department and cannot create subjects for another department's class (${classDoc.name}).`,
      });
    }

    // 3. Create Subject
    let subject = await Subject.findOne({ code: code.toUpperCase(), academicClass: classDoc._id });
    if (!subject) {
      subject = await Subject.create({
        name,
        code: code.toUpperCase(),
        department: deptDoc._id,
        academicClass: classDoc._id,
        faculty: facultyId,
        semester: Number(semester) || 4,
        credits: Number(credits) || 4,
      });
    } else {
      subject.faculty = facultyId;
      await subject.save();
    }

    // 4. Ensure FacultyAssignment exists
    let assignment = await FacultyAssignment.findOne({
      faculty: facultyId,
      subject: subject._id,
      academicClass: classDoc._id,
    });
    if (!assignment) {
      await FacultyAssignment.create({
        faculty: facultyId,
        subject: subject._id,
        academicClass: classDoc._id,
        department: deptDoc._id,
      });
    }

    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('faculty', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('department', 'name code')
      .populate('academicClass', 'name year semester');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FACULTY ASSIGNMENTS ====================

export const getFacultyAssignments = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    } else if (req.query.faculty) {
      query.faculty = req.query.faculty;
    }
    if (req.query.academicClass) query.academicClass = req.query.academicClass;
    if (req.query.subject) query.subject = req.query.subject;

    const assignments = await FacultyAssignment.find(query)
      .populate('faculty', 'name email profileInfo')
      .populate('subject', 'name code credits')
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFacultyAssignment = async (req, res) => {
  try {
    const { faculty, subject, academicClass, department } = req.body;
    const existing = await FacultyAssignment.findOne({ faculty, subject, academicClass });
    if (existing) {
      return res.status(400).json({ message: 'Faculty assignment already exists for this subject and class' });
    }
    const assignment = await FacultyAssignment.create({ faculty, subject, academicClass, department });
    const populated = await FacultyAssignment.findById(assignment._id)
      .populate('faculty', 'name email profileInfo')
      .populate('subject', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFacultyAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await FacultyAssignment.findByIdAndDelete(id);
    if (!assignment) return res.status(404).json({ message: 'Faculty assignment not found' });
    res.json({ message: 'Faculty assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== STUDENT ENROLLMENTS ====================

export const getStudentEnrollments = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.query.student) {
      query.student = req.query.student;
    }
    if (req.query.academicClass) query.academicClass = req.query.academicClass;
    if (req.query.department) query.department = req.query.department;

    const enrollments = await StudentEnrollment.find(query)
      .populate('student', 'name email profileInfo')
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const enrollStudent = async (req, res) => {
  try {
    const { student, academicClass, department, rollNumber } = req.body;
    const existing = await StudentEnrollment.findOne({ student });
    if (existing) {
      existing.academicClass = academicClass;
      existing.department = department;
      existing.rollNumber = rollNumber;
      await existing.save();
      const updated = await StudentEnrollment.findById(existing._id)
        .populate('student', 'name email profileInfo')
        .populate('academicClass', 'name year semester')
        .populate('department', 'name code');
      return res.json(updated);
    }

    const enrollment = await StudentEnrollment.create({ student, academicClass, department, rollNumber });
    const populated = await StudentEnrollment.findById(enrollment._id)
      .populate('student', 'name email profileInfo')
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStudentEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await StudentEnrollment.findByIdAndDelete(id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Student enrollment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PUBLIC ENDPOINTS FOR REGISTRATION ====================

export const getPublicDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicClassesByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      const all = await AcademicClass.find()
        .populate('department', 'name code')
        .sort({ name: 1 });
      return res.json(all);
    }

    let deptDoc = null;
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

    let classes = [];
    if (deptDoc) {
      classes = await AcademicClass.find({ department: deptDoc._id })
        .populate('department', 'name code')
        .sort({ name: 1 });
    }

    if (classes.length === 0 && department) {
      const deptCode = DEPT_CODES[department] || String(department).split(' ').map((w) => w[0]).join('').toUpperCase();
      if (!deptDoc) {
        deptDoc = await Department.create({
          name: department,
          code: deptCode,
          description: `${department} Department`,
        });
      }
      await AcademicClass.create([
        { name: `${deptCode}-D1`, department: deptDoc._id, year: 'Second Year', semester: 3 },
        { name: `${deptCode}-D2`, department: deptDoc._id, year: 'Second Year', semester: 3 },
      ]);
      classes = await AcademicClass.find({ department: deptDoc._id })
        .populate('department', 'name code')
        .sort({ name: 1 });
    }

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
