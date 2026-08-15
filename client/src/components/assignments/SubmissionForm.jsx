import React, { useState } from 'react';
import Input from '../Input';
import Button from '../Button';
import { Send, FileCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadSubmissionFile } from '../../services/submissionService';

const SubmissionForm = ({ onSubmit, loading, initialSubmission }) => {
  const [content, setContent] = useState(initialSubmission?.content || '');
  const [fileUrl, setFileUrl] = useState(initialSubmission?.fileUrl || '');
  const [fileName, setFileName] = useState(initialSubmission?.fileName || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError('File size must be under 25MB.');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let finalFileUrl = fileUrl;
      let finalFileName = fileName;

      if (selectedFile) {
        setUploading(true);
        const reader = new FileReader();
        const fileData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(selectedFile);
        });

        const uploadRes = await uploadSubmissionFile(selectedFile.name, fileData);
        finalFileUrl = uploadRes.fileUrl;
        finalFileName = uploadRes.fileName;
        setUploading(false);
      }

      if (!finalFileUrl && !content.trim()) {
        setError('Please attach a file or enter a submission comment.');
        return;
      }

      onSubmit({
        content,
        fileUrl: finalFileUrl,
        fileName: finalFileName,
      });
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || 'Failed to process file upload.');
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
        <FileCheck className="w-5 h-5 text-brand-600" />
        <span>{initialSubmission ? 'Replace / Update Submission' : 'Submit Assignment Work'}</span>
      </h3>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Upload Field */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Upload Academic File (PDF, PPT, DOC, XLS, ZIP, Image - Max 25MB) *
        </label>
        <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl p-4 bg-slate-50/50 transition-colors text-center cursor-pointer relative">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,image/*"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center space-y-1.5 pointer-events-none">
            <Upload className="w-6 h-6 text-brand-500" />
            <span className="text-xs font-bold text-slate-800">
              {fileName || selectedFile ? (
                <span className="text-emerald-700 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected: {fileName || selectedFile.name}</span>
                </span>
              ) : (
                'Choose File or Drop File Here'
              )}
            </span>
            <span className="text-[11px] text-slate-400">Supported: .pdf, .ppt, .pptx, .doc, .docx, .xls, .xlsx, .zip, Images</span>
          </div>
        </div>
      </div>

      {/* Submission Comment */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Submission Comment / Notes (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="e.g., Completed the assignment PPT according to the given guidelines..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading || uploading}>
          <Send className="w-4 h-4 mr-1.5" />
          <span>{uploading ? 'Uploading File...' : loading ? 'Submitting...' : initialSubmission ? 'Replace Submission' : 'Upload & Submit'}</span>
        </Button>
      </div>
    </form>
  );
};

export default SubmissionForm;
