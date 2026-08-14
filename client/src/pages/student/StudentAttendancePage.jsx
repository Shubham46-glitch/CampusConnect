import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getStudentMyAttendance } from '../../services/attendanceService';

const StudentAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentMyAttendance();
      setData(res);
    } catch (err) {
      console.error('Error fetching student attendance:', err);
      setError(err.response?.data?.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your attendance breakdown..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-4 max-w-lg mx-auto my-8">
        <p className="text-xs font-semibold text-rose-900">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchAttendance}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const { overallPercentage = 0, totalClasses = 0, totalPresent = 0, totalAbsent = 0, subjects = [], department, academicClass } = data || {};

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-brand-600" />
            <span>My Attendance</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {academicClass ? `${academicClass.name} (${academicClass.year}) • ${department?.name || 'Department'}` : 'Subject-wise attendance tracking'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAttendance}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Attendance</span>
            <Award className="w-5 h-5 text-brand-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{overallPercentage}%</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalClasses === 0 ? 'bg-slate-100 text-slate-600 border border-slate-200' : overallPercentage >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : overallPercentage >= 75 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {totalClasses === 0 ? 'No Lectures' : overallPercentage >= 90 ? 'Good' : overallPercentage >= 75 ? 'Average' : 'Low / Warning'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cumulative across all enrolled subjects</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Conducted</span>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalClasses}</div>
          <p className="text-[11px] text-slate-400 mt-2">Completed lecture sessions</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions Attended</span>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600">{totalPresent}</div>
          <p className="text-[11px] text-emerald-600 mt-2">Marked present</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions Missed</span>
          <div className="mt-3 text-3xl font-extrabold text-rose-600">{totalAbsent}</div>
          <p className="text-[11px] text-rose-600 mt-2">Marked absent</p>
        </div>
      </div>

      {/* Subject Wise Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span>Subject-Wise Attendance Breakdown</span>
        </h2>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.subjectId}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-4"
                onClick={() => setSelectedSubject(sub)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {sub.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{sub.subjectName}</h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                      sub.statusRating === 'Good'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.statusRating === 'Warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : sub.statusRating === 'Low'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {sub.statusRating === 'Good' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {sub.statusRating === 'Warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {sub.statusRating === 'Low' && <XCircle className="w-3.5 h-3.5" />}
                    <span>{sub.statusRating === 'No Lectures' ? 'No Lectures Yet' : sub.statusRating}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Present Rate</span>
                    <span className="font-bold text-slate-900">
                      {sub.presentCount} / {sub.totalSessions} ({sub.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        sub.percentage >= 85 ? 'bg-emerald-500' : sub.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-brand-600 font-semibold">
                  <span>View Attendance History</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 italic">
            No subject enrollments found.
          </div>
        )}
      </div>

      {/* History Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedSubject.subjectCode} • {academicClass?.name || 'Class'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedSubject.subjectName}</h3>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Conducted</span>
                <span className="text-sm font-extrabold text-slate-900">{selectedSubject.totalSessions}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Present</span>
                <span className="text-sm font-extrabold text-emerald-600">{selectedSubject.presentCount}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Percentage</span>
                <span className="text-sm font-extrabold text-brand-600">{selectedSubject.percentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Log</h4>
              {selectedSubject.history && selectedSubject.history.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                  {selectedSubject.history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-white text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.sessionTime}</span>
                      </div>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center space-x-1 ${
                          item.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{item.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No attendance records logged for this subject yet.</p>
              )}
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedSubject(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
