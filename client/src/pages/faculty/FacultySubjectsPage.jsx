import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, CheckSquare, History, RefreshCw, Plus, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getFacultyMySubjects } from '../../services/attendanceService';
import { createFacultySubject, getFacultyDepartmentClasses } from '../../services/academicService';
import useAuth from '../../hooks/useAuth';

const FacultySubjectsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Create Subject Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    departmentName: user?.department || 'Information Technology',
    className: '',
  });

  const navigate = useNavigate();

  const getDeptShortCode = (deptName) => {
    if (!deptName) return 'CS';
    if (deptName === 'Computer Science') return 'CS';
    if (deptName === 'Electronics & Computer Science') return 'ECS';
    if (deptName === 'Information Technology') return 'IT';
    if (deptName.includes('Data Science')) return 'AIDS';
    if (deptName.includes('Machine Learning')) return 'AIML';
    return deptName.split(' ').map((w) => w[0]).join('').toUpperCase();
  };

  const currentDeptCode = getDeptShortCode(user?.department);
  const fallbackClasses = [
    { _id: 'fb-1', name: `${currentDeptCode}-D1`, year: 'Second Year' },
    { _id: 'fb-2', name: `${currentDeptCode}-D2`, year: 'Second Year' },
  ];

  const displayClasses = availableClasses.length > 0 ? availableClasses : fallbackClasses;

  const fetchFacultyClasses = async (targetDept) => {
    try {
      setClassesLoading(true);
      const deptToFetch = targetDept || user?.department;
      const res = await getFacultyDepartmentClasses(deptToFetch ? { department: deptToFetch } : {});
      const list = res || [];
      setAvailableClasses(list);
      const effectiveList = list.length > 0 ? list : fallbackClasses;
      setFormData((prev) => ({
        ...prev,
        departmentName: user?.department || 'Computer Science',
        className: prev.className && effectiveList.some((c) => c.name === prev.className) ? prev.className : effectiveList[0].name,
      }));
    } catch (err) {
      console.error('Error fetching faculty classes:', err);
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFacultyMySubjects();
      setSubjects(res || []);
    } catch (err) {
      console.error('Error fetching faculty subjects:', err);
      setError(err.response?.data?.message || 'Failed to load assigned subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    if (user?.department) {
      fetchFacultyClasses(user.department);
    }
  }, [user]);

  useEffect(() => {
    if (showCreateModal) {
      fetchFacultyClasses(user?.department);
    }
  }, [showCreateModal, user]);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setModalError(null);
      await createFacultySubject(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        code: '',
        departmentName: user?.department || 'Computer Science',
        className: 'SYCS-1',
      });
      fetchSubjects();
    } catch (err) {
      console.error('Error creating subject:', err);
      setModalError(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your assigned subjects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-4 max-w-lg mx-auto my-8">
        <p className="text-xs font-semibold text-rose-900">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchSubjects}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BookOpen className="w-7 h-7 text-brand-600" />
            <span>My Subjects & Classes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your authorized academic classes, manage student attendance, and review session logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Subject</span>
          </Button>

          <Button variant="outline" size="sm" onClick={fetchSubjects}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {subjects.map((item) => {
            const sub = item.subject || {};
            const cls = item.academicClass || {};
            const dept = item.department || {};

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                      {sub.code || 'SUB'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{sub.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dept.name || user?.department || 'Department'} • {sub.credits ? `${sub.credits} Credits` : '4 Credits'}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center min-w-[80px]">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Division</span>
                    <span className="text-sm font-extrabold text-slate-900">{cls.name || 'SYCS-1'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">{item.studentCount}</strong> Students Enrolled
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">{item.totalSessions}</strong> Sessions Conducted
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 inline-flex items-center justify-center space-x-1.5"
                    onClick={() =>
                      navigate(`/faculty/take-attendance?subjectId=${sub._id}&classId=${cls._id || ''}&subjectName=${encodeURIComponent(sub.name)}&className=${encodeURIComponent(cls.name || '')}`)
                    }
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Take Attendance</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 inline-flex items-center justify-center space-x-1.5"
                    onClick={() =>
                      navigate(`/faculty/attendance-history?subjectId=${sub._id}&classId=${cls._id || ''}`)
                    }
                  >
                    <History className="w-4 h-4" />
                    <span>View History</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Subjects Created Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not created any subjects yet. Click the button below to define your subject and start taking lecture attendance.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Your First Subject</span>
          </Button>
        </div>
      )}

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <span>Create New Subject</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.department || 'Department'}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-semibold cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class / Division
                </label>
                <select
                  required
                  value={formData.className || (displayClasses[0] ? displayClasses[0].name : '')}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold text-slate-900 bg-white"
                >
                  {displayClasses.map((cls) => (
                    <option key={cls._id || cls.name} value={cls.name}>
                      {cls.name} ({cls.year || 'Second Year'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={createSubmitting}>
                  {createSubmitting ? 'Creating...' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySubjectsPage;
