import React, { useState, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';
import { DEPARTMENTS } from '../../constants/departments';
import useAuth from '../../hooks/useAuth';

const STATUS_OPTIONS = ['active', 'closed', 'archived'];

const AssignmentForm = ({ initialValues = {}, onSubmit, loading, submitText = 'Publish Assignment' }) => {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    department: isFaculty ? user.department : DEPARTMENTS[0],
    section: 'All Divisions',
    dueDate: '',
    totalMarks: 100,
    status: 'active',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        subject: initialValues.subject || '',
        department: isFaculty ? user?.department : initialValues.department || DEPARTMENTS[0],
        section: initialValues.section || 'All Divisions',
        dueDate: initialValues.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '',
        totalMarks: initialValues.totalMarks !== undefined ? initialValues.totalMarks : 100,
        status: initialValues.status || 'active',
      });
    } else if (isFaculty && user?.department) {
      setFormData((prev) => ({ ...prev, department: user.department }));
    }
  }, [initialValues, user, isFaculty]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const targetDept = isFaculty ? user?.department : formData.department;

    if (!formData.title.trim() || !formData.description.trim() || !formData.subject.trim() || !targetDept || !formData.dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(formData.totalMarks) < 1) {
      setError('Total marks must be at least 1.');
      return;
    }

    onSubmit({ ...formData, department: targetDept, section: formData.section || 'All Divisions' });
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Assignment Title"
        name="title"
        placeholder="e.g., MERN Stack E-Commerce API Implementation"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Assignment Description & Guidelines *
        </label>
        <textarea
          name="description"
          rows={5}
          placeholder="Detailed problem statement and submission instructions..."
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Subject / Course"
          name="subject"
          placeholder="e.g., Full Stack Web Development"
          value={formData.subject}
          onChange={handleChange}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Target Department *
          </label>
          <select
            name="department"
            value={formData.department || (isFaculty ? user?.department : DEPARTMENTS[0])}
            onChange={handleChange}
            disabled={isFaculty}
            className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none ${
              isFaculty ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed font-semibold' : 'bg-white border-slate-300'
            }`}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Target Division / Section *
          </label>
          <select
            name="section"
            value={formData.section || 'All Divisions'}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-slate-900"
          >
            <option value="All Divisions">All Divisions (Entire Dept)</option>
            <option value="Division 1">Division 1</option>
            <option value="Division 2">Division 2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />

        <Input
          label="Total Marks"
          name="totalMarks"
          type="number"
          min="1"
          value={formData.totalMarks}
          onChange={handleChange}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none capitalize"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default AssignmentForm;
