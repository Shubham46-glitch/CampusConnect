import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import AssignmentForm from '../../components/assignments/AssignmentForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAssignmentById, updateAssignment } from '../../services/assignmentService';

const EditAssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const data = await getAssignmentById(id);
        setInitialValues(data);
      } catch (err) {
        setError('Failed to load assignment details for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);
      setError('');
      await updateAssignment(id, formData);
      navigate(`/assignments/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment.');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading assignment details..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to={`/assignments/${id}`} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Edit className="w-5 h-5 text-indigo-600" />
            <span>Edit Assignment</span>
          </h1>
          <p className="text-xs text-slate-500">Modify title, due date, marks, or description.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <AssignmentForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        loading={saving}
        submitText="Update Assignment"
      />
    </div>
  );
};

export default EditAssignmentPage;
