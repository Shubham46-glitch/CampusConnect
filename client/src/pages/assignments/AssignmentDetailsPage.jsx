import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Award, User, BookOpen, FileText, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import AssignmentStatusBadge from '../../components/assignments/AssignmentStatusBadge';
import SubmissionForm from '../../components/assignments/SubmissionForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { getAssignmentById, deleteAssignment, submitAssignment } from '../../services/assignmentService';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';

const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const data = await getAssignmentById(id);
      setAssignment(data);

      // If user is student, fetch their submission if exists
      if (user?.role === 'student') {
        try {
          const res = await API.get(`/assignments/${id}/submissions`);
          // Or fetch user submission
          if (res.data?.submissions) {
            const mySub = res.data.submissions.find((s) => s.student?._id === user._id || s.student === user._id);
            if (mySub) setSubmission(mySub);
          }
        } catch (subErr) {
          // If 403 or no submission API, fetch directly
        }
      }
      setError('');
    } catch (err) {
      setError('Assignment not found or access forbidden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id, user]);

  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmitWork = async (submissionData) => {
    try {
      setSubmitting(true);
      setSuccessMsg('');
      const res = await submitAssignment(id, submissionData);
      setSubmission(res.submission);
      setSuccessMsg(res.message || 'Assignment submitted successfully');
      fetchAssignmentData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit assignment.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment? All student submissions will also be deleted.')) {
      try {
        setDeleteLoading(true);
        await deleteAssignment(id);
        navigate('/assignments');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete assignment');
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading assignment details..." />;
  }

  if (error || !assignment) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl inline-block text-xs font-semibold">
          {error || 'Assignment not found'}
        </div>
        <div>
          <Link to="/assignments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Assignments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = assignment.faculty?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canModify = isCreator || isAdmin;

  const isOverdue = new Date(assignment.dueDate) < new Date();
  const isClosed = assignment.status === 'closed' || isOverdue;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <Link to="/assignments" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to All Assignments</span>
        </Link>

        {canModify && (
          <div className="flex items-center space-x-2">
            <Link to={`/assignments/${assignment._id}/submissions`}>
              <Button variant="secondary" size="sm">
                <FileText className="w-3.5 h-3.5 mr-1" />
                View Submissions
              </Button>
            </Link>
            <Link to={`/assignments/${assignment._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" size="sm" disabled={deleteLoading} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
                {assignment.subject}
              </span>
              {assignment.section && assignment.section !== 'All Divisions' && assignment.section !== 'All' ? (
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
                  {assignment.section}
                </span>
              ) : (
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
                  All Divisions
                </span>
              )}
              <AssignmentStatusBadge status={isOverdue && assignment.status === 'active' ? 'closed' : assignment.status} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{assignment.title}</h1>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Total Marks</span>
            <span className="text-2xl font-black text-amber-800">{assignment.totalMarks}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Due Date</span>
            <p className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
              {new Date(assignment.dueDate).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Department</span>
            <p className="font-bold text-slate-800 flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              {assignment.department}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Faculty Instructor</span>
            <p className="font-bold text-slate-800 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              {assignment.faculty?.name || 'Faculty Member'}
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assignment Description & Guidelines</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{assignment.description}</p>
        </div>
      </div>

      {/* Student Submission & Evaluation Section */}
      {user?.role === 'student' && (
        <div className="space-y-6">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {submission && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Your Active Submission</span>
                </h3>
                <AssignmentStatusBadge status={submission.status === 'graded' ? 'evaluated' : submission.status} />
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-500">
                  Submitted on: <strong className="text-slate-800">{new Date(submission.submittedAt).toLocaleString()}</strong>
                </p>

                {submission.content && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Comment</span>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 leading-relaxed">
                      {submission.content}
                    </div>
                  </div>
                )}

                {(submission.fileUrl || submission.fileName) && (
                  <div className="p-3 bg-brand-50/60 border border-brand-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{submission.fileName || 'Submitted_Academic_File'}</span>
                    </div>
                    {submission.fileUrl && (
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white border border-brand-200 hover:bg-brand-50 text-brand-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1 shrink-0"
                      >
                        <span>View / Download</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Evaluation / Grade Display */}
              {(submission.status === 'graded' || submission.status === 'evaluated') && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Faculty Assessment & Marks</span>
                    </span>
                    <span className="text-xl font-black text-emerald-900 bg-white px-3 py-0.5 rounded-lg border border-emerald-300">
                      {submission.marks} / {assignment.totalMarks}
                    </span>
                  </div>
                  {submission.feedback ? (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Faculty Feedback:</span>
                      <p className="text-xs text-emerald-900 italic font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-200/60">
                        "{submission.feedback}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 italic">No written feedback provided.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!isClosed ? (
            <SubmissionForm
              onSubmit={handleSubmitWork}
              loading={submitting}
              initialSubmission={submission}
            />
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
              ⚠️ This assignment is closed. Submissions are no longer accepted.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailsPage;
