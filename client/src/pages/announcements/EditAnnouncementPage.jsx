import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAnnouncementById, updateAnnouncement } from '../../services/announcementService';

const EditAnnouncementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncementById(id);
        setInitialValues(data);
      } catch (err) {
        setError('Failed to load announcement details for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);
      setError('');
      await updateAnnouncement(id, formData);
      navigate(`/announcements/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement.');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading announcement details..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to={`/announcements/${id}`} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Edit className="w-5 h-5 text-indigo-600" />
            <span>Edit Announcement</span>
          </h1>
          <p className="text-xs text-slate-500">Modify notice content, priority, category, or audience.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <AnnouncementForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        loading={saving}
        submitText="Update Announcement"
      />
    </div>
  );
};

export default EditAnnouncementPage;
