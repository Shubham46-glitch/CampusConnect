import React, { useState, useEffect } from 'react';
import Input from '../Input';
import Button from '../Button';
import { EVENT_CATEGORIES } from '../../utils/constants';
import { DEPARTMENTS } from '../../constants/departments';

const EventForm = ({ initialValues = {}, onSubmit, loading, submitText = 'Save Event' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'academic',
    audienceType: 'ALL',
    department: '',
    capacity: 100,
    status: 'upcoming',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        date: initialValues.date ? new Date(initialValues.date).toISOString().split('T')[0] : '',
        time: initialValues.time || '',
        venue: initialValues.venue || '',
        category: initialValues.category || 'academic',
        audienceType: initialValues.audienceType || 'ALL',
        department: initialValues.department || '',
        capacity: initialValues.capacity || 100,
        status: initialValues.status || 'upcoming',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.venue.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(formData.capacity) < 1) {
      setError('Capacity must be at least 1 seat.');
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
        label="Event Title"
        name="title"
        placeholder="e.g., Annual Tech Symposium 2026"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Description *
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder="Provide complete event details and objectives..."
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <Input
          label="Time"
          name="time"
          placeholder="e.g., 10:00 AM - 1:00 PM"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Venue Location"
          name="venue"
          placeholder="e.g., Main Auditorium Hall B"
          value={formData.venue}
          onChange={handleChange}
          required
        />
        <Input
          label="Capacity (Seats)"
          name="capacity"
          type="number"
          min={1}
          value={formData.capacity}
          onChange={handleChange}
          required
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
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Audience Scope *
          </label>
          <select
            name="audienceType"
            value={formData.audienceType || 'ALL'}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-slate-800"
          >
            <option value="ALL">College-Wide (All Students & Faculty)</option>
            <option value="DEPARTMENT">Department Specific</option>
          </select>
        </div>
      </div>

      {formData.audienceType === 'DEPARTMENT' && (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Target Department *
          </label>
          <select
            name="department"
            value={formData.department || DEPARTMENTS[0]}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none capitalize"
        >
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
