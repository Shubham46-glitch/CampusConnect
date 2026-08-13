import React, { useState } from 'react';
import Input from '../Input';
import Button from '../Button';
import { Award, X } from 'lucide-react';

const GradeModal = ({ submission, totalMarks, onClose, onSubmit, loading }) => {
  const [marks, setMarks] = useState(submission?.marks !== undefined ? submission.marks : '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      setError('Marks cannot be negative.');
      return;
    }

    if (numMarks > totalMarks) {
      setError(`Marks cannot exceed total marks (${totalMarks}).`);
      return;
    }

    onSubmit({ marks: numMarks, feedback });
  };

  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Grade Student Submission</h3>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
          <p className="text-slate-600">
            Student: <strong className="text-slate-800">{submission.student?.name}</strong> ({submission.student?.email})
          </p>
          <p className="text-slate-500">Total Available Marks: <strong>{totalMarks}</strong></p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={`Awarded Marks (Max: ${totalMarks})`}
            type="number"
            min="0"
            max={totalMarks}
            placeholder={`0 - ${totalMarks}`}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Faculty Feedback & Comments
            </label>
            <textarea
              rows={4}
              placeholder="Constructive feedback for student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting Grade...' : 'Save Grade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeModal;
