import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getComplaintById, updateComplaint } from '../../services/complaintService';

const EditComplaintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const data = await getComplaintById(id);
        if (data.status !== 'pending') {
          setError('Cannot edit complaint after processing has started.');
        }
        setInitialValues(data);
      } catch (err) {
        setError('Failed to load complaint details for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);
      setError('');
      await updateComplaint(id, formData);
      navigate(`/complaints/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint.');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading complaint details..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to={`/complaints/${id}`} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Edit className="w-5 h-5 text-indigo-600" />
            <span>Edit Grievance</span>
          </h1>
          <p className="text-xs text-slate-500">Modify title, description, or category while status is pending.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {initialValues?.status === 'pending' ? (
        <ComplaintForm
          initialValues={initialValues}
          onSubmit={handleUpdate}
          loading={saving}
          submitText="Update Complaint"
        />
      ) : (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-500">Editing is locked for non-pending grievances.</p>
          <Link to={`/complaints/${id}`}>
            <Button size="sm">View Complaint</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EditComplaintPage;
