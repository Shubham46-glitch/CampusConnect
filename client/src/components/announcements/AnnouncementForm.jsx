import React, { useState, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';

const CATEGORIES = ['academic', 'event', 'examination', 'placement', 'general', 'urgent'];
const PRIORITIES = ['low', 'medium', 'high'];
const TARGET_AUDIENCES = ['all', 'students', 'faculty', 'department'];

const AnnouncementForm = ({ initialValues = {}, onSubmit, loading, submitText = 'Publish Announcement' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: 'all',
    department: '',
    expiresAt: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        title: initialValues.title || '',
        content: initialValues.content || '',
        category: initialValues.category || 'general',
        priority: initialValues.priority || 'medium',
        targetAudience: initialValues.targetAudience || 'all',
        department: initialValues.department || '',
        expiresAt: initialValues.expiresAt ? new Date(initialValues.expiresAt).toISOString().split('T')[0] : '',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please provide title and content.');
      return;
    }

    if (formData.targetAudience === 'department' && !formData.department.trim()) {
      setError('Department is required when target audience is set to Department.');
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
        label="Announcement Title"
        name="title"
        placeholder="e.g., End-Semester Examination Schedule Announced"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Announcement Content *
        </label>
        <textarea
          name="content"
          rows={5}
          placeholder="Write complete notice information..."
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Target Audience *
          </label>
          <select
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none capitalize"
          >
            {TARGET_AUDIENCES.map((aud) => (
              <option key={aud} value={aud}>
                {aud}
              </option>
            ))}
          </select>
        </div>

        {formData.targetAudience === 'department' ? (
          <Input
            label="Department Name"
            name="department"
            placeholder="e.g., Computer Science"
            value={formData.department}
            onChange={handleChange}
            required
          />
        ) : (
          <Input
            label="Expiration Date (Optional)"
            name="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={handleChange}
          />
        )}
      </div>

      {formData.targetAudience === 'department' && (
        <Input
          label="Expiration Date (Optional)"
          name="expiresAt"
          type="date"
          value={formData.expiresAt}
          onChange={handleChange}
        />
      )}

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Publishing...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
