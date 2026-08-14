import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  RotateCcw,
  CheckCheck,
  Send,
  AlertCircle,
  History,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getStudentsForSession, recordAttendanceSession } from '../../services/attendanceService';

const TakeAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subjectId = searchParams.get('subjectId');
  const classId = searchParams.get('classId');
  const subjectName = searchParams.get('subjectName') || 'Subject';
  const className = searchParams.get('className') || 'Class';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'Present' | 'Absent' }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('10:00 AM');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const [existingSession, setExistingSession] = useState(null);

  const fetchRoster = async (targetDate) => {
    if (!subjectId) {
      setError('Missing subject parameter');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const queryDate = targetDate || date;
      const res = await getStudentsForSession(subjectId, classId, queryDate);
      const studentList = res?.students || (Array.isArray(res) ? res : []);
      setStudents(studentList);
      setExistingSession(res?.existingSession || null);

      if (res?.existingSession && res?.existingAttendance && Object.keys(res.existingAttendance).length > 0) {
        setAttendance(res.existingAttendance);
        if (res.existingSession.sessionTime) {
          setSessionTime(res.existingSession.sessionTime);
        }
      } else {
        const initialMap = {};
        studentList.forEach((s) => {
          initialMap[s._id] = 'Present';
        });
        setAttendance(initialMap);
      }
    } catch (err) {
      console.error('Error loading session students:', err);
      setError(err.response?.data?.message || 'Failed to load class roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster(date);
  }, [subjectId, classId, date]);

  const handleToggle = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = 'Present';
    });
    setAttendance(updated);
  };

  const handleReset = () => {
    handleMarkAllPresent();
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'Present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'Absent').length;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const recordsPayload = students.map((s) => ({
        studentId: s._id,
        status: attendance[s._id] || 'Present',
      }));

      const res = await recordAttendanceSession({
        subjectId,
        classId,
        date,
        sessionTime,
        attendanceRecords: recordsPayload,
      });

      setShowConfirmModal(false);
      setSubmissionResult(res);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError(err.response?.data?.message || 'Failed to record attendance session');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading class roster for attendance session..." />
      </div>
    );
  }

  if (submissionResult) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-5 shadow-sm select-none">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Successfully Recorded</h2>
          <p className="text-xs text-slate-500 mt-1">
            {subjectName} • {className} • {new Date(date).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-center">
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-400">Total</span>
            <span className="text-lg font-extrabold text-slate-900">{students.length}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-400">Present</span>
            <span className="text-lg font-extrabold text-emerald-600">{submissionResult.totalPresent}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-400">Absent</span>
            <span className="text-lg font-extrabold text-rose-600">{submissionResult.totalAbsent}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/faculty/subjects')}
          >
            Back to My Subjects
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => navigate(`/faculty/attendance-history?subjectId=${subjectId}&classId=${classId}`)}
          >
            View Attendance History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
              {className}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Take Attendance: {subjectName}
            </h1>
          </div>
        </div>

        {/* Date & Time Selectors */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200/80 px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200/80 px-3 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-slate-400" />
            <select
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="01:30 PM">01:30 PM</option>
              <option value="02:30 PM">02:30 PM</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          {error.includes('already recorded') && (
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-slate-50 text-xs shrink-0"
              onClick={() => navigate(`/faculty/attendance-history?subjectId=${subjectId}&classId=${classId}`)}
            >
              <History className="w-3.5 h-3.5 mr-1" /> View / Edit History
            </Button>
          )}
        </div>
      )}

      {existingSession && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Attendance already marked for {new Date(date).toLocaleDateString()}</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Modifying student records below will update the existing lecture attendance session.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-slate-50 text-xs shrink-0 border-amber-300 text-amber-800"
            onClick={() => navigate(`/faculty/attendance-history?subjectId=${subjectId}&classId=${classId}`)}
          >
            <History className="w-3.5 h-3.5 mr-1" /> View History
          </Button>
        </div>
      )}

      {/* Summary Bar & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Students</span>
            <span className="text-lg font-extrabold text-slate-900">{students.length}</span>
          </div>
          <div className="text-xs">
            <span className="text-emerald-600 block text-[10px] font-bold uppercase">Present</span>
            <span className="text-lg font-extrabold text-emerald-600">{presentCount}</span>
          </div>
          <div className="text-xs">
            <span className="text-rose-600 block text-[10px] font-bold uppercase">Absent</span>
            <span className="text-lg font-extrabold text-rose-600">{absentCount}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleMarkAllPresent} className="inline-flex items-center space-x-1">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleReset} className="inline-flex items-center space-x-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setShowConfirmModal(true)} className="inline-flex items-center space-x-1">
            <Send className="w-3.5 h-3.5" />
            <span>Submit Attendance</span>
          </Button>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Roster ({students.length})</h3>
          <span className="text-[11px] text-slate-400">Click toggle or select Present / Absent per student</span>
        </div>

        {students.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {students.map((student, idx) => {
              const status = attendance[student._id] || 'Present';
              const isPresent = status === 'Present';

              return (
                <div
                  key={student._id}
                  className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isPresent ? 'hover:bg-slate-50/50' : 'bg-rose-50/20 hover:bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {student.rollNumber || String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{student.name}</h4>
                      <span className="text-[11px] text-slate-400">{student.email}</span>
                    </div>
                  </div>

                  {/* Present / Absent Radio Toggle Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(student._id, 'Present')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(student._id, 'Absent')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        !isPresent
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 italic">No enrolled students found in this class.</div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 select-none">
            <h3 className="text-lg font-bold text-slate-900">Confirm Attendance Submission</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to submit attendance for <strong>{subjectName}</strong> ({className}) on <strong>{new Date(date).toLocaleDateString()}</strong>?
            </p>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Present Students:</span>
                <strong className="text-emerald-600">{presentCount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Absent Students:</span>
                <strong className="text-rose-600">{absentCount}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">Total Roster:</span>
                <strong className="text-slate-900">{students.length}</strong>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={submitting}
                onClick={handleSubmit}
              >
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAttendancePage;
