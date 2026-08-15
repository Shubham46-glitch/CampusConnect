import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Award, ExternalLink, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import AssignmentStatusBadge from '../../components/assignments/AssignmentStatusBadge';
import GradeModal from '../../components/assignments/GradeModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { getAssignmentSubmissions } from '../../services/assignmentService';
import { evaluateSubmission } from '../../services/submissionService';
import { getFileUrl } from '../../services/api';

const AssignmentSubmissionsPage = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await getAssignmentSubmissions(id);
      setData(res);
      setError('');
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError(err.response?.data?.message || 'Failed to fetch student submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const handleGradeSubmit = async (gradeData) => {
    try {
      setGradingLoading(true);
      const subId = selectedSubmission.submissionId || selectedSubmission._id;
      await evaluateSubmission(subId, gradeData);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading assignment roster & submissions..." />;
  }

  if (error || !data) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl inline-block text-xs font-semibold">
          {error || 'Failed to load submissions'}
        </div>
        <div>
          <Link to={`/assignments/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Assignment Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = data.stats || {
    totalStudents: data.count || 0,
    submittedCount: data.submissions?.filter((s) => s.status === 'submitted').length || 0,
    lateCount: data.submissions?.filter((s) => s.status === 'late').length || 0,
    evaluatedCount: data.submissions?.filter((s) => s.status === 'evaluated' || s.status === 'graded').length || 0,
    notSubmittedCount: 0,
  };

  const rosterList = data.roster && data.roster.length > 0
    ? data.roster
    : data.submissions?.map((s) => ({
        student: s.student,
        hasSubmitted: true,
        submissionId: s._id,
        submittedAt: s.submittedAt,
        fileName: s.fileName || (s.fileUrl ? 'Submitted_File' : ''),
        fileUrl: s.fileUrl,
        content: s.content,
        status: s.status === 'graded' ? 'evaluated' : s.status,
        marks: s.marks,
        feedback: s.feedback,
      })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link to={`/assignments/${id}`} className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Assignment</span>
        </Link>
        <Badge variant="primary">Total Marks: {data.totalMarks}</Badge>
      </div>

      {/* Assignment Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-brand-600" />
              <span>Assignment Submissions Dashboard</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Course / Subject: <strong className="text-slate-800">{data.subject || data.assignmentTitle}</strong> • Target: <strong className="text-slate-800">{data.department} ({data.section || 'All Divisions'})</strong>
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Students</span>
            <span className="text-xl font-black text-slate-900">{stats.totalStudents}</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Submitted</span>
            <span className="text-xl font-black text-emerald-900">{stats.submittedCount}</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Late</span>
            <span className="text-xl font-black text-amber-900">{stats.lateCount}</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Evaluated</span>
            <span className="text-xl font-black text-indigo-900">{stats.evaluatedCount}</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Not Submitted</span>
            <span className="text-xl font-black text-rose-900">{stats.notSubmittedCount}</span>
          </div>
        </div>
      </div>

      {/* Roster & Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Student Coursework Roster</h3>
        {rosterList.length > 0 ? (
          <Table headers={['Student Name', 'Roll / Email', 'Submission File', 'Submitted On', 'Status', 'Marks', 'Action']}>
            {rosterList.map((item, idx) => {
              const st = item.student || {};
              const isEvaluated = item.status === 'evaluated' || item.status === 'graded';
              return (
                <tr key={item.submissionId || idx} className="hover:bg-slate-50 transition-colors text-xs">
                  <td className="px-4 py-3 font-bold text-slate-900">{st.name || 'Student'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-mono text-slate-800 font-bold">{st.profileInfo?.rollNumber || 'N/A'}</div>
                    <div className="text-[11px] text-slate-400">{st.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.hasSubmitted ? (
                      item.fileUrl ? (
                        <a
                          href={getFileUrl(item.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline font-semibold inline-flex items-center space-x-1"
                        >
                          <span>{item.fileName || 'Download File'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-700 italic">Text Content</span>
                      )
                    ) : (
                      <span className="text-slate-400 italic">No File</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <AssignmentStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {isEvaluated ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.marks} / {data.totalMarks}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic font-normal">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.hasSubmitted ? (
                      <Button
                        size="sm"
                        variant={isEvaluated ? 'outline' : 'primary'}
                        onClick={() => setSelectedSubmission(item)}
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        <span>{isEvaluated ? 'Edit Grade' : 'Evaluate Work'}</span>
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No students targeted for this assignment yet.
          </div>
        )}
      </div>

      {/* Grade Evaluation Modal */}
      {selectedSubmission && (
        <GradeModal
          submission={selectedSubmission}
          totalMarks={data.totalMarks}
          onClose={() => setSelectedSubmission(null)}
          onSubmit={handleGradeSubmit}
          loading={gradingLoading}
        />
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;
