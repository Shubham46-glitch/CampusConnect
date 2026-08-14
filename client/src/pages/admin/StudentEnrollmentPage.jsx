import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import API from '../../services/api';
import { getStudentEnrollments, enrollStudent, deleteStudentEnrollment, getAcademicClasses, getDepartments } from '../../services/academicService';

const StudentEnrollmentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    academicClass: '',
    department: '',
    rollNumber: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [enrRes, clsRes, deptRes, stuRes] = await Promise.all([
        getStudentEnrollments(),
        getAcademicClasses(),
        getDepartments(),
        API.get('/users?role=student'),
      ]);

      setEnrollments(enrRes || []);
      setClasses(clsRes || []);
      setDepartments(deptRes || []);
      const stus = stuRes.data || [];
      setStudents(stus);

      if (stus.length > 0 && clsRes.length > 0 && deptRes.length > 0) {
        setFormData({
          student: stus[0]._id,
          academicClass: clsRes[0]._id,
          department: clsRes[0].department?._id || deptRes[0]._id,
          rollNumber: '01',
        });
      }
    } catch (err) {
      console.error('Error fetching student enrollments:', err);
      setError(err.response?.data?.message || 'Failed to load student enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      const selectedClass = classes.find((c) => c._id === formData.academicClass);
      const payload = {
        ...formData,
        department: selectedClass?.department?._id || selectedClass?.department || formData.department,
      };

      await enrollStudent(payload);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this enrollment?')) return;
    try {
      await deleteStudentEnrollment(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete enrollment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student roster..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-7 h-7 text-brand-600" />
            <span>Student Roster & Class Enrollments</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enroll students into academic classes (e.g. SYIT-2) and assign official roll numbers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Enroll Student
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students ({enrollments.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Academic Class</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-extrabold text-slate-900">{item.rollNumber}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">
                    {item.student?.name}
                    <span className="block text-[10px] font-normal text-slate-400">{item.student?.email}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-brand-700">{item.academicClass?.name || 'N/A'}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-600">{item.department?.name || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(item._id)} className="text-slate-400 hover:text-rose-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Enroll Student into Class</h3>
            <form onSubmit={handleEnroll} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Academic Class</label>
                <select
                  value={formData.academicClass}
                  onChange={(e) => setFormData({ ...formData, academicClass: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.department?.code || ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button variant="outline" className="flex-1" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" type="submit">
                  Save Enrollment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnrollmentPage;
