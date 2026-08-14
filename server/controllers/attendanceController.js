import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import Subject from '../models/Subject.js';
import AcademicClass from '../models/AcademicClass.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// ==================== FACULTY: GET MY ASSIGNED & CREATED SUBJECTS ====================
export const getFacultyMySubjects = async (req, res) => {
  try {
    const facultyId = req.user._id;

    // 1. Fetch subjects directly created/owned by faculty
    const ownedSubjects = await Subject.find({ faculty: facultyId })
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');

    // 2. Fetch assigned subjects from FacultyAssignment
    const assignments = await FacultyAssignment.find({ faculty: facultyId, status: 'active' })
      .populate('subject', 'name code credits')
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');

    const subjectsMap = new Map();

    ownedSubjects.forEach((sub) => {
      subjectsMap.set(sub._id.toString(), {
        id: sub._id,
        subject: sub,
        academicClass: sub.academicClass,
        department: sub.department,
      });
    });

    assignments.forEach((assign) => {
      if (assign.subject && !subjectsMap.has(assign.subject._id.toString())) {
        subjectsMap.set(assign.subject._id.toString(), {
          id: assign._id,
          subject: assign.subject,
          academicClass: assign.academicClass,
          department: assign.department,
        });
      }
    });

    const resultList = Array.from(subjectsMap.values());

    const result = await Promise.all(
      resultList.map(async (item) => {
        const classId = item.academicClass?._id;
        const deptName = item.department?.name;

        let studentCount = 0;
        if (classId) {
          studentCount = await StudentEnrollment.countDocuments({
            academicClass: classId,
            status: 'active',
          });
        }

        if (studentCount === 0 && (deptName || req.user.department)) {
          const targetDept = deptName || req.user.department;
          studentCount = await User.countDocuments({
            role: 'student',
            department: new RegExp(targetDept.trim(), 'i'),
          });
        }

        const totalSessions = await AttendanceSession.countDocuments({
          subject: item.subject?._id,
          ...(classId ? { academicClass: classId } : {}),
        });

        return {
          id: item.id,
          subject: item.subject,
          academicClass: item.academicClass,
          department: item.department,
          studentCount,
          totalSessions,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FACULTY: GET STUDENTS FOR ATTENDANCE SESSION ====================
export const getStudentsForSession = async (req, res) => {
  try {
    const { subjectId, classId, date } = req.query;

    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId is required' });
    }

    const subjectObj = await Subject.findById(subjectId)
      .populate('department', 'name code')
      .populate('academicClass', 'name year semester');

    if (!subjectObj) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const targetClassId = classId || subjectObj.academicClass?._id;

    // Permission check for Faculty
    if (req.user.role === 'faculty') {
      const isOwner = subjectObj.faculty && subjectObj.faculty.toString() === req.user._id.toString();
      const isAssigned = await FacultyAssignment.findOne({
        faculty: req.user._id,
        subject: subjectId,
        status: 'active',
      });

      if (!isOwner && !isAssigned) {
        return res.status(403).json({ message: 'Forbidden: You do not own or teach this subject' });
      }
    }

    let students = [];

    if (targetClassId) {
      const enrollments = await StudentEnrollment.find({ academicClass: targetClassId, status: 'active' })
        .populate('student', 'name email profileInfo department')
        .sort({ rollNumber: 1 });

      students = enrollments.map((e) => ({
        _id: e.student._id,
        name: e.student.name,
        email: e.student.email,
        rollNumber: e.rollNumber || e.student.profileInfo?.rollNumber || 'N/A',
        avatar: e.student.profileInfo?.avatar || '',
        department: e.student.department,
      }));
    }

    if (students.length === 0) {
      const targetDept = subjectObj.department?.name || req.user.department;
      const deptStudents = await User.find({
        role: 'student',
        ...(targetDept ? { department: new RegExp(targetDept.trim(), 'i') } : {}),
      })
        .select('name email profileInfo department')
        .sort({ name: 1 });

      students = deptStudents.map((s, idx) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        rollNumber: s.profileInfo?.rollNumber || `CS${String(idx + 1).padStart(3, '0')}`,
        avatar: s.profileInfo?.avatar || '',
        department: s.department,
      }));
    }

    // Check if an attendance session already exists for this date
    let existingSession = null;
    let existingAttendance = {};

    if (date && targetClassId) {
      const sessionDate = new Date(date);
      sessionDate.setHours(0, 0, 0, 0);

      const foundSession = await AttendanceSession.findOne({
        subject: subjectId,
        academicClass: targetClassId,
        date: sessionDate,
      });

      if (foundSession) {
        existingSession = {
          _id: foundSession._id,
          date: foundSession.date,
          sessionTime: foundSession.sessionTime,
          totalPresent: foundSession.totalPresent,
          totalAbsent: foundSession.totalAbsent,
        };

        const records = await AttendanceRecord.find({ session: foundSession._id });
        records.forEach((r) => {
          existingAttendance[r.student.toString()] = r.status;
        });
      }
    }

    res.json({
      students,
      subject: {
        _id: subjectObj._id,
        name: subjectObj.name,
        code: subjectObj.code,
        department: subjectObj.department,
        academicClass: subjectObj.academicClass,
      },
      existingSession,
      existingAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FACULTY: RECORD ATTENDANCE SESSION ====================
export const recordAttendanceSession = async (req, res) => {
  try {
    const { subjectId, classId, date, sessionTime, attendanceRecords } = req.body;

    if (!subjectId || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Missing required attendance data' });
    }

    const subjectObj = await Subject.findById(subjectId);
    if (!subjectObj) return res.status(404).json({ message: 'Subject not found' });

    const targetClassId = classId || subjectObj.academicClass;

    // Permission check for Faculty
    if (req.user.role === 'faculty') {
      const isOwner = subjectObj.faculty && subjectObj.faculty.toString() === req.user._id.toString();
      const isAssigned = await FacultyAssignment.findOne({
        faculty: req.user._id,
        subject: subjectId,
        status: 'active',
      });
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to take attendance for this subject' });
      }
    }

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const timeStr = sessionTime || '10:00 AM';

    // Check if duplicate session exists for the same subject, class, and date
    let session = await AttendanceSession.findOne({
      subject: subjectId,
      academicClass: targetClassId,
      date: sessionDate,
    });

    let totalPresent = 0;
    let totalAbsent = 0;

    attendanceRecords.forEach((r) => {
      if (r.status === 'Present') totalPresent++;
      else totalAbsent++;
    });

    if (session) {
      session.sessionTime = timeStr;
      session.totalPresent = totalPresent;
      session.totalAbsent = totalAbsent;
      await session.save();
    } else {
      session = await AttendanceSession.create({
        subject: subjectId,
        academicClass: targetClassId,
        faculty: req.user._id,
        department: subjectObj.department,
        date: sessionDate,
        sessionTime: timeStr,
        totalPresent,
        totalAbsent,
      });
    }

    for (const r of attendanceRecords) {
      const studentId = r.studentId || r.student;
      await AttendanceRecord.findOneAndUpdate(
        { session: session._id, student: studentId },
        {
          session: session._id,
          student: studentId,
          subject: subjectId,
          academicClass: targetClassId,
          status: r.status,
          date: sessionDate,
        },
        { upsert: true, new: true }
      );
    }

    // CREATE IN-APP NOTIFICATIONS AFTER SUCCESSFUL DB SAVE (Requirement 15, 16, 17)
    const formattedDate = sessionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    for (const r of attendanceRecords) {
      const studentId = r.studentId || r.student;
      if (studentId) {
        await createNotification({
          recipient: studentId,
          title: 'Attendance Marked',
          message: `${subjectObj.name} attendance has been marked for ${formattedDate}. Status: ${r.status}.`,
          type: 'attendance',
          relatedId: session._id,
          relatedType: 'AttendanceSession',
        });
      }
    }

    const populatedSession = await AttendanceSession.findById(session._id)
      .populate('subject', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('faculty', 'name');

    res.status(201).json({
      message: 'Attendance successfully recorded and notifications sent',
      session: populatedSession,
      totalPresent,
      totalAbsent,
      totalStudents: attendanceRecords.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==================== FACULTY: UPDATE ATTENDANCE SESSION ====================
export const updateAttendanceSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendanceRecords } = req.body;

    const session = await AttendanceSession.findById(sessionId).populate('subject', 'name code');
    if (!session) return res.status(404).json({ message: 'Attendance session not found' });

    // Authorization check
    if (req.user.role === 'faculty' && session.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only edit attendance sessions created by you' });
    }

    if (attendanceRecords && Array.isArray(attendanceRecords)) {
      let totalPresent = 0;
      let totalAbsent = 0;

      for (const rec of attendanceRecords) {
        const studentId = rec.studentId || rec.student;
        const status = rec.status;

        if (status === 'Present') totalPresent++;
        else totalAbsent++;

        await AttendanceRecord.findOneAndUpdate(
          { session: sessionId, student: studentId },
          { status, date: session.date },
          { upsert: true, new: true }
        );
      }

      session.totalPresent = totalPresent;
      session.totalAbsent = totalAbsent;
      await session.save();

      // CREATE IN-APP NOTIFICATIONS AFTER SUCCESSFUL DB UPDATE (Requirement 15, 16, 17)
      const formattedDate = session.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      for (const rec of attendanceRecords) {
        const studentId = rec.studentId || rec.student;
        if (studentId) {
          await createNotification({
            recipient: studentId,
            title: 'Attendance Marked',
            message: `${session.subject?.name || 'Subject'} attendance has been marked for ${formattedDate}. Status: ${rec.status}.`,
            type: 'attendance',
            relatedId: session._id,
            relatedType: 'AttendanceSession',
          });
        }
      }
    }

    const updatedSession = await AttendanceSession.findById(sessionId)
      .populate('subject', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('faculty', 'name');

    const updatedRecords = await AttendanceRecord.find({ session: sessionId })
      .populate('student', 'name email profileInfo');

    res.json({
      message: 'Attendance session successfully updated',
      session: updatedSession,
      records: updatedRecords,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==================== FACULTY: GET ATTENDANCE HISTORY ====================
export const getFacultyAttendanceHistory = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    }
    if (req.query.subjectId) query.subject = req.query.subjectId;
    if (req.query.classId) query.academicClass = req.query.classId;

    const sessions = await AttendanceSession.find(query)
      .populate('subject', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('faculty', 'name')
      .sort({ date: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FACULTY / ADMIN: GET SESSION DETAILS ====================
export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId)
      .populate('subject', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('faculty', 'name email');

    if (!session) return res.status(404).json({ message: 'Attendance session not found' });

    const records = await AttendanceRecord.find({ session: sessionId })
      .populate('student', 'name email profileInfo')
      .sort({ createdAt: 1 });

    res.json({ session, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== STUDENT: GET MY ATTENDANCE ====================
export const getStudentMyAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find student's enrollment
    const enrollment = await StudentEnrollment.findOne({ student: studentId, status: 'active' })
      .populate('academicClass', 'name year semester')
      .populate('department', 'name code');

    if (!enrollment) {
      return res.json({
        enrolled: false,
        overallPercentage: 0,
        totalClasses: 0,
        totalPresent: 0,
        totalAbsent: 0,
        subjects: [],
        department: null,
        academicClass: null,
      });
    }

    const classId = enrollment.academicClass._id;

    // Get subjects for this class
    const subjects = await Subject.find({ academicClass: classId, status: 'active' });

    let grandTotalSessions = 0;
    let grandTotalPresent = 0;
    let grandTotalAbsent = 0;

    const subjectStats = await Promise.all(
      subjects.map(async (sub) => {
        const totalSessions = await AttendanceSession.countDocuments({
          subject: sub._id,
          academicClass: classId,
        });

        const records = await AttendanceRecord.find({
          student: studentId,
          subject: sub._id,
        })
          .populate('session', 'date sessionTime faculty')
          .sort({ date: -1 });

        let presentCount = 0;
        let absentCount = 0;

        const history = records.map((r) => {
          if (r.status === 'Present') presentCount++;
          else absentCount++;
          return {
            id: r._id,
            date: r.date,
            status: r.status,
            sessionTime: r.session?.sessionTime || '10:00 AM',
          };
        });

        grandTotalSessions += totalSessions;
        grandTotalPresent += presentCount;
        grandTotalAbsent += absentCount;

        const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

        // Visual status badge rating
        let statusRating = 'No Lectures';
        if (totalSessions > 0) {
          if (percentage < 75) statusRating = 'Low';
          else if (percentage < 85) statusRating = 'Warning';
          else statusRating = 'Good';
        }

        return {
          subjectId: sub._id,
          subjectName: sub.name,
          subjectCode: sub.code,
          credits: sub.credits,
          totalSessions,
          presentCount,
          absentCount,
          percentage,
          statusRating,
          history,
        };
      })
    );

    const overallPercentage = grandTotalSessions > 0 ? Math.round((grandTotalPresent / grandTotalSessions) * 100) : 0;

    res.json({
      enrolled: true,
      department: enrollment.department,
      academicClass: enrollment.academicClass,
      rollNumber: enrollment.rollNumber,
      overallPercentage,
      totalClasses: grandTotalSessions,
      totalPresent: grandTotalPresent,
      totalAbsent: grandTotalAbsent,
      subjects: subjectStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ADMIN: ATTENDANCE ANALYTICS ====================
export const getAdminAttendanceAnalytics = async (req, res) => {
  try {
    const { department, academicClass, subject, faculty } = req.query;

    const sessionQuery = {};
    if (department) sessionQuery.department = department;
    if (academicClass) sessionQuery.academicClass = academicClass;
    if (subject) sessionQuery.subject = subject;
    if (faculty) sessionQuery.faculty = faculty;

    const sessions = await AttendanceSession.find(sessionQuery)
      .populate('subject', 'name code')
      .populate('academicClass', 'name year semester')
      .populate('faculty', 'name')
      .populate('department', 'name code');

    let totalSessions = sessions.length;
    let totalPresentSum = 0;
    let totalAbsentSum = 0;

    sessions.forEach((s) => {
      totalPresentSum += s.totalPresent;
      totalAbsentSum += s.totalAbsent;
    });

    const totalAttendanceEntries = totalPresentSum + totalAbsentSum;
    const overallPercentage = totalAttendanceEntries > 0 ? Math.round((totalPresentSum / totalAttendanceEntries) * 100) : 0;

    // Breakdown by department
    const deptMap = {};
    sessions.forEach((s) => {
      const deptName = s.department?.name || 'Unknown';
      if (!deptMap[deptName]) deptMap[deptName] = { present: 0, total: 0 };
      deptMap[deptName].present += s.totalPresent;
      deptMap[deptName].total += s.totalPresent + s.totalAbsent;
    });

    const departmentStats = Object.keys(deptMap).map((name) => ({
      name,
      percentage: deptMap[name].total > 0 ? Math.round((deptMap[name].present / deptMap[name].total) * 100) : 0,
      totalClasses: deptMap[name].total,
    }));

    // Breakdown by subject
    const subjectMap = {};
    sessions.forEach((s) => {
      const subName = s.subject?.name || 'Unknown';
      if (!subjectMap[subName]) subjectMap[subName] = { present: 0, total: 0 };
      subjectMap[subName].present += s.totalPresent;
      subjectMap[subName].total += s.totalPresent + s.totalAbsent;
    });

    const subjectStats = Object.keys(subjectMap).map((name) => ({
      name,
      percentage: subjectMap[name].total > 0 ? Math.round((subjectMap[name].present / subjectMap[name].total) * 100) : 0,
    }));

    // Breakdown by faculty
    const facultyMap = {};
    sessions.forEach((s) => {
      const facName = s.faculty?.name || 'Unknown';
      if (!facultyMap[facName]) facultyMap[facName] = { present: 0, total: 0, sessions: 0 };
      facultyMap[facName].present += s.totalPresent;
      facultyMap[facName].total += s.totalPresent + s.totalAbsent;
      facultyMap[facName].sessions += 1;
    });

    const facultyStats = Object.keys(facultyMap).map((name) => ({
      name,
      sessionsCount: facultyMap[name].sessions,
      percentage: facultyMap[name].total > 0 ? Math.round((facultyMap[name].present / facultyMap[name].total) * 100) : 0,
    }));

    const enrolledStudentsCount = await StudentEnrollment.countDocuments(department ? { department } : {});

    res.json({
      overallPercentage,
      totalSessions,
      totalEnrolledStudents: enrolledStudentsCount,
      totalPresentSum,
      totalAbsentSum,
      departmentStats,
      subjectStats,
      facultyStats,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
