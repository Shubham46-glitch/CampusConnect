import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Award, ExternalLink, CheckCircle2 } from 'lucide-react';
import AssignmentStatusBadge from '../../components/assignments/AssignmentStatusBadge';
import GradeModal from '../../components/assignments/GradeModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { getAssignmentSubmissions } from '../../services/assignmentService';
import { gradeSubmission } from '../../services/submissionService';

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
      await gradeSubmission(selectedSubmission._id, gradeData);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit grade');
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading student submissions..." />;
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link to={`/assignments/${id}`} className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Assignment</span>
        </Link>
        <Badge variant="primary">Total Marks: {data.totalMarks}</Badge>
      </div>

      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-brand-600" />
          <span>Student Submissions ({data.count})</span>
        </h1>
        <p className="text-xs text-slate-500">
          Assignment: <strong className="text-slate-800">{data.assignmentTitle}</strong>
        </p>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        {data.submissions?.length > 0 ? (
          <Table headers={['Student Name', 'Email / Roll', 'Submitted On', 'Status', 'Marks', 'Action']}>
            {data.submissions.map((sub) => (
              <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{sub.student?.name}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  <div>{sub.student?.email}</div>
                  <div className="text-slate-400 font-mono">{sub.student?.profileInfo?.rollNumber || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(sub.submittedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <AssignmentStatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 font-bold text-slate-800 text-xs">
                  {sub.status === 'graded' ? `${sub.marks} / ${data.totalMarks}` : 'Not Graded'}
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant={sub.status === 'graded' ? 'outline' : 'primary'}
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <Award className="w-3.5 h-3.5 mr-1" />
                    <span>{sub.status === 'graded' ? 'Edit Grade' : 'Grade Work'}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No student submissions received for this assignment yet.
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
