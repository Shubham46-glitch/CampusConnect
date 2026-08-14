import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getAcademicClasses, createAcademicClass, deleteAcademicClass, getDepartments } from '../../services/academicService';

const ClassManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: 'Second Year',
    semester: 4,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [clsRes, deptRes] = await Promise.all([getAcademicClasses(), getDepartments()]);
      setClasses(clsRes || []);
      setDepartments(deptRes || []);
      if (deptRes && deptRes.length > 0) {
        setFormData((prev) => ({ ...prev, department: deptRes[0]._id }));
      }
    } catch (err) {
      console.error('Error loading academic classes:', err);
      setError(err.response?.data?.message || 'Failed to load academic classes');
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
      await createAcademicClass(formData);
      setShowModal(false);
      setFormData({ name: '', department: departments[0]?._id || '', year: 'Second Year', semester: 4 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create academic class');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this academic class?')) return;
    try {
      await deleteAcademicClass(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading academic classes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-7 h-7 text-brand-600" />
            <span>Academic Classes & Divisions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage academic divisions (e.g. SYIT-2), semesters, and departmental associations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Class
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800">{error}</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                  {c.department?.code || 'DEPT'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{c.name}</h3>
                <p className="text-xs text-slate-500">{c.department?.name}</p>
              </div>
              <button onClick={() => handleDelete(c._id)} className="text-slate-400 hover:text-rose-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Year</span>
                <span className="font-semibold text-slate-800">{c.year}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Semester</span>
                <span className="font-semibold text-slate-800">Sem {c.semester}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Academic Class</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Class / Division Name (e.g. SYIT-2)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SYIT-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  >
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button variant="outline" className="flex-1" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" type="submit">
                  Save Class
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagementPage;
