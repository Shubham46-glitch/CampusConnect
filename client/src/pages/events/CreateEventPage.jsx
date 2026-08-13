import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import { createEvent } from '../../services/eventService';

const CreateEventPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      setError('');
      const newEvent = await createEvent(formData);
      navigate(`/events/${newEvent._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please check inputs.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/events" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>Publish Campus Event</span>
          </h1>
          <p className="text-xs text-slate-500">Fill out details to create a new college event or workshop.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <EventForm onSubmit={handleCreate} loading={loading} submitText="Publish Event" />
    </div>
  );
};

export default CreateEventPage;
