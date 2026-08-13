import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Megaphone } from 'lucide-react';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import { createAnnouncement } from '../../services/announcementService';

const CreateAnnouncementPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      setError('');
      const newAnnouncement = await createAnnouncement(formData);
      navigate(`/announcements/${newAnnouncement._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/announcements" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-brand-600" />
            <span>Publish Campus Announcement</span>
          </h1>
          <p className="text-xs text-slate-500">Post official notices, examination updates, or department alerts.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <AnnouncementForm onSubmit={handleCreate} loading={loading} submitText="Publish Announcement" />
    </div>
  );
};

export default CreateAnnouncementPage;
