import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import API from '../../services/api';
import { getFacultyAssignments, createFacultyAssignment, deleteFacultyAssignment, getSubjects, getAcademicClasses } from '../../services/academicService';

const FacultyAssignmentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    faculty: '',
    subject: '',
    academicClass: '',
    department: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignRes, subRes, clsRes, userRes] = await Promise.all([
        getFacultyAssignments(),
        getSubjects(),
        getAcademicClasses(),
        API.get('/users?role=faculty'),
      ]);

      setAssignments(assignRes || []);
      setSubjects(subRes || []);
      setClasses(clsRes || []);
      const facs = userRes.data || [];
      setFacultyList(facs);

      if (facs.length > 0 && subRes.length > 0 && clsRes.length > 0) {
        setFormData({
          faculty: facs[0]._id,
          subject: subRes[0]._id,
          academicClass: clsRes[0]._id,
          department: subRes[0].department?._id || clsRes[0].department?._id || '',
        });
      }
    } catch (err) {
      console.error('Error fetching faculty assignments:', err);
      setError(err.response?.data?.message || 'Failed to load faculty assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const selectedSub = subjects.find((s) => s._id === formData.subject);
      const payload = {
        ...formData,
        department: selectedSub?.department?._id || selectedSub?.department || formData.department,
      };

      await createFacultyAssignment(payload);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign faculty');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this faculty assignment?')) return;
    try {
      await deleteFacultyAssignment(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading faculty assignments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <UserCheck className="w-7 h-7 text-brand-600" />
            <span>Faculty Roster & Subject Assignments</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Map faculty members to authorized subjects and academic classes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Assign Faculty
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800">{error}</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.academicClass?.name || 'Class'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{item.faculty?.name || 'Faculty Member'}</h3>
                <p className="text-xs text-slate-500">{item.faculty?.email}</p>
              </div>
              <button onClick={() => handleDelete(item._id)} className="text-slate-400 hover:text-rose-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Subject</span>
              <span className="font-bold text-brand-700">
                {item.subject?.code} — {item.subject?.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Assign Faculty to Subject</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Faculty Member</label>
                <select
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Academic Class</label>
                <select
                  value={formData.academicClass}
                  onChange={(e) => setFormData({ ...formData, academicClass: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button variant="outline" className="flex-1" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" type="submit">
                  Save Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignmentPage;
