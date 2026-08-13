import React, { useState, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';
import useAuth from '../../hooks/useAuth';

const CATEGORIES = ['academic', 'infrastructure', 'faculty', 'examination', 'fees', 'technical', 'hostel', 'library', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

const ComplaintForm = ({ initialValues = {}, onSubmit, loading, submitText = 'Submit Complaint' }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    department: user?.department || '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        category: initialValues.category || 'academic',
        priority: initialValues.priority || 'medium',
        department: initialValues.department || user?.department || '',
      });
    }
  }, [initialValues, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.department.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Grievance Title"
        name="title"
        placeholder="e.g., Project Lab Computer 14 Display Issue"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Detailed Description *
        </label>
        <textarea
          name="description"
          rows={5}
          placeholder="Describe your issue or concern in detail..."
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none capitalize"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Priority Level *
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none capitalize"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p} priority
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Department"
          name="department"
          placeholder="e.g., Computer Science"
          value={formData.department}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default ComplaintForm;
