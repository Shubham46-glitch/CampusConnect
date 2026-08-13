import React, { useState } from 'react';
import Input from '../Input';
import Button from '../Button';
import { Send, FileCheck } from 'lucide-react';

const SubmissionForm = ({ onSubmit, loading, initialSubmission }) => {
  const [content, setContent] = useState(initialSubmission?.content || '');
  const [fileUrl, setFileUrl] = useState(initialSubmission?.fileUrl || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Submission text/content is required.');
      return;
    }

    onSubmit({ content, fileUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
        <FileCheck className="w-4 h-4 text-brand-600" />
        <span>{initialSubmission ? 'Update Your Submission' : 'Submit Assignment Work'}</span>
      </h3>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Submission Code / Solution Text *
        </label>
        <textarea
          rows={5}
          placeholder="Paste your code solution, GitHub repo description, or project summary..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400 font-mono text-xs"
        />
      </div>

      <Input
        label="Project Artifact / Code Repository Link (Optional)"
        placeholder="https://github.com/username/project-repo"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          <Send className="w-4 h-4 mr-1.5" />
          <span>{loading ? 'Submitting...' : initialSubmission ? 'Resubmit Work' : 'Submit Assignment'}</span>
        </Button>
      </div>
    </form>
  );
};

export default SubmissionForm;
