import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { History, Calendar, CheckCircle2, XCircle, ArrowLeft, RefreshCw, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getFacultyAttendanceHistory, getSessionDetails, updateAttendanceSession } from '../../services/attendanceService';

const FacultyAttendanceHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subjectId = searchParams.get('subjectId');
  const classId = searchParams.get('classId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editRecords, setEditRecords] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (subjectId) params.subjectId = subjectId;
      if (classId) params.classId = classId;

      const res = await getFacultyAttendanceHistory(params);
      setSessions(res || []);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      setError(err.response?.data?.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [subjectId, classId]);

  const handleOpenSession = async (session) => {
    setSelectedSession(session);
    setIsEditing(false);
    try {
      setSessionLoading(true);
      const res = await getSessionDetails(session._id);
      setSessionDetails(res);

      const map = {};
      (res?.records || []).forEach((r) => {
        const studentId = r.student?._id || r.student;
        if (studentId) map[studentId] = r.status || 'Present';
      });
      setEditRecords(map);
    } catch (err) {
      console.error('Error loading session breakdown:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleSaveSessionEdit = async () => {
    if (!selectedSession?._id) return;
    try {
      setEditSaving(true);
      const recordsPayload = Object.keys(editRecords).map((sId) => ({
        studentId: sId,
        status: editRecords[sId],
      }));

      const res = await updateAttendanceSession(selectedSession._id, {
        attendanceRecords: recordsPayload,
      });

      setSelectedSession(res.session);
      setIsEditing(false);
      fetchHistory();
    } catch (err) {
      console.error('Error updating session attendance:', err);
      alert(err.response?.data?.message || 'Failed to update attendance session');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading attendance history..." />
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <History className="w-6 h-6 text-brand-600" />
              <span>Attendance History</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Review past recorded attendance sessions and student logs</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchHistory}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Refresh</span>
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800">{error}</div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recorded Sessions ({sessions.length})</h3>
          <span className="text-[11px] text-slate-400">Click any session to view student breakdown</span>
        </div>

        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3 text-center">Present</th>
                  <th className="px-5 py-3 text-center">Absent</th>
                  <th className="px-5 py-3 text-center">Attendance %</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => {
                  const total = s.totalPresent + s.totalAbsent;
                  const pct = total > 0 ? Math.round((s.totalPresent / total) * 100) : 0;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {new Date(s.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="block text-[10px] font-normal text-slate-400">{s.sessionTime}</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{s.subject?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">{s.academicClass?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-center font-extrabold text-emerald-600">{s.totalPresent}</td>
                      <td className="px-5 py-3.5 text-center font-extrabold text-rose-600">{s.totalAbsent}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`font-extrabold px-2 py-0.5 rounded-md ${pct >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenSession(s)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 italic">No recorded attendance sessions found.</div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-600">
                  {selectedSession.academicClass?.name} • {new Date(selectedSession.date).toLocaleDateString()} at {selectedSession.sessionTime || '10:00 AM'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedSession.subject?.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit Attendance
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleSaveSessionEdit} disabled={editSaving}>
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    setSessionDetails(null);
                    setIsEditing(false);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {sessionLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" text="Loading session records..." />
              </div>
            ) : sessionDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-center">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Present</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {isEditing ? Object.values(editRecords).filter((s) => s === 'Present').length : selectedSession.totalPresent}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Absent</span>
                    <span className="text-base font-extrabold text-rose-600">
                      {isEditing ? Object.values(editRecords).filter((s) => s === 'Absent').length : selectedSession.totalAbsent}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Attendance %</span>
                    <span className="text-base font-extrabold text-brand-600">
                      {Math.round(
                        ((isEditing ? Object.values(editRecords).filter((s) => s === 'Present').length : selectedSession.totalPresent) /
                          (selectedSession.totalPresent + selectedSession.totalAbsent || 1)) *
                          100
                      )}%
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  {sessionDetails.records.map((r, idx) => {
                    const studentId = r.student?._id || r.student;
                    const currentStatus = isEditing ? (editRecords[studentId] || 'Present') : r.status;

                    return (
                      <div key={r._id} className="flex items-center justify-between px-4 py-2.5 bg-white text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-bold text-slate-400 w-6">
                            {r.student?.profileInfo?.rollNumber || idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{r.student?.name}</span>
                            <span className="text-[10px] text-slate-400">{r.student?.email}</span>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditRecords({ ...editRecords, [studentId]: 'Present' })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditRecords({ ...editRecords, [studentId]: 'Absent' })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        ) : (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex items-center space-x-3">
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                  disabled={editSaving}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedSession(null);
                  setSessionDetails(null);
                  setIsEditing(false);
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

export default FacultyAttendanceHistoryPage;
