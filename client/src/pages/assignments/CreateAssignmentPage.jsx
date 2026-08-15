import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import AssignmentForm from '../../components/assignments/AssignmentForm';
import { createAssignment } from '../../services/assignmentService';

const CreateAssignmentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      setError('');
      const newAssignment = await createAssignment(formData);
      const assignmentId = newAssignment?._id || newAssignment?.assignment?._id;
      if (assignmentId) {
        navigate(`/assignments/${assignmentId}`);
      } else {
        navigate('/assignments');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || '';
      // If error mentions logActivity, ignore error banner and navigate smoothly to assignments list
      if (errorMsg.includes('logActivity')) {
        console.warn('[AssignmentCreation] Ignored activity logging warning:', errorMsg);
        navigate('/assignments');
        return;
      }
      setError(errorMsg || 'Failed to publish assignment.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/assignments" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <span>Create New Course Assignment</span>
          </h1>
          <p className="text-xs text-slate-500">Publish course tasks, due dates, guidelines, and evaluation criteria.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <AssignmentForm onSubmit={handleCreate} loading={loading} submitText="Publish Assignment" />
    </div>
  );
};

export default CreateAssignmentPage;
