import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Filter,
  Users,
  Award,
  Calendar,
  BookOpen,
  UserCheck,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import API from '../../services/api';
import { getAdminAttendanceAnalytics, getSessionDetails } from '../../services/attendanceService';
import { getDepartments, getAcademicClasses, getSubjects } from '../../services/academicService';

const AdminAttendanceAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filter options lists
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Selected filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);

  const fetchFilters = async () => {
    try {
      const [deptRes, clsRes, subRes, facRes] = await Promise.all([
        getDepartments(),
        getAcademicClasses(),
        getSubjects(),
        API.get('/users?role=faculty'),
      ]);
      setDepartments(deptRes || []);
      setClasses(clsRes || []);
      setSubjects(subRes || []);
      setFacultyList(facRes.data || []);
    } catch (err) {
      console.error('Error fetching analytics filters:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (selectedClass) params.academicClass = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedFaculty) params.faculty = selectedFaculty;

      const res = await getAdminAttendanceAnalytics(params);
      setData(res);
    } catch (err) {
      console.error('Error fetching admin attendance analytics:', err);
      setError(err.response?.data?.message || 'Failed to load attendance analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, selectedClass, selectedSubject, selectedFaculty]);

  const handleOpenSession = async (session) => {
    setSelectedSession(session);
    try {
      setSessionLoading(true);
      const res = await getSessionDetails(session._id);
      setSessionDetails(res);
    } catch (err) {
      console.error('Error loading session breakdown:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const {
    overallPercentage = 0,
    totalSessions = 0,
    totalEnrolledStudents = 0,
    departmentStats = [],
    subjectStats = [],
    facultyStats = [],
    sessions = [],
  } = data || {};

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-brand-600" />
            <span>Attendance Analytics & Drilldown</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Multi-dimensional attendance overview across departments, classes, subjects, and faculty.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {/* Multi-Dimensional Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Analytics Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 bg-slate-50"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Academic Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 bg-slate-50"
            >
              <option value="">All Academic Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 bg-slate-50"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Faculty Member</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 bg-slate-50"
            >
              <option value="">All Faculty</option>
              {facultyList.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Calculating analytics metrics..." />
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Overall Attendance</span>
                <Award className="w-5 h-5 text-brand-600" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-slate-900">{overallPercentage}%</div>
              <p className="text-[11px] text-slate-400 mt-1">Filtered average</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Enrolled Students</span>
              <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalEnrolledStudents}</div>
              <p className="text-[11px] text-slate-400 mt-1">Students in scope</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <span className="text-xs font-semibold uppercase text-slate-500">Sessions Conducted</span>
              <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalSessions}</div>
              <p className="text-[11px] text-slate-400 mt-1">Recorded sessions</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <span className="text-xs font-semibold uppercase text-slate-500">Top Performing Subject</span>
              <div className="mt-3 text-xl font-extrabold text-emerald-600 truncate">
                {subjectStats[0]?.name || 'N/A'}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">{subjectStats[0] ? `${subjectStats[0].percentage}% Attendance` : 'No data'}</p>
            </div>
          </div>

          {/* Breakdown Tables / Grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>Department Breakdown</span>
              </h3>
              <div className="space-y-2 text-xs">
                {departmentStats.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">{d.name}</span>
                    <span className="font-extrabold text-brand-700">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Subject Breakdown</span>
              </h3>
              <div className="space-y-2 text-xs">
                {subjectStats.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="font-extrabold text-emerald-600">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Faculty Performance</span>
              </h3>
              <div className="space-y-2 text-xs">
                {facultyStats.map((f) => (
                  <div key={f.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800 block">{f.name}</span>
                      <span className="text-[10px] text-slate-400">{f.sessionsCount} Sessions</span>
                    </div>
                    <span className="font-extrabold text-indigo-600">{f.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recorded Sessions Drilldown List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtered Attendance Sessions ({sessions.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Faculty</th>
                    <th className="px-5 py-3 text-center">Present / Absent</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {new Date(s.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{s.department?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 font-semibold text-brand-700">{s.academicClass?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{s.subject?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{s.faculty?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                        <span className="text-emerald-600">{s.totalPresent}</span> / <span className="text-rose-600">{s.totalAbsent}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenSession(s)}>
                          View Drilldown
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Session Drilldown Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-600">
                  {selectedSession.academicClass?.name} • {new Date(selectedSession.date).toLocaleDateString()}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedSession.subject?.name}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setSessionDetails(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sessionLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" text="Loading session drilldown..." />
              </div>
            ) : sessionDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-center text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Faculty</span>
                    <span className="font-bold text-slate-900">{selectedSession.faculty?.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Present</span>
                    <span className="font-extrabold text-emerald-600">{selectedSession.totalPresent}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Absent</span>
                    <span className="font-extrabold text-rose-600">{selectedSession.totalAbsent}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  {sessionDetails.records.map((r, idx) => (
                    <div key={r._id} className="flex items-center justify-between px-4 py-2 bg-white text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] font-bold text-slate-400 w-6">
                          {r.student?.profileInfo?.rollNumber || idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{r.student?.name}</span>
                          <span className="text-[10px] text-slate-400">{r.student?.email}</span>
                        </div>
                      </div>

                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center space-x-1 ${
                          r.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{r.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedSession(null);
                  setSessionDetails(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceAnalyticsPage;
