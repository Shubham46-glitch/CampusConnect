import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Search, Filter, ExternalLink, Award, Calendar, CheckCircle2, Clock } from 'lucide-react';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import AssignmentStatusBadge from '../../components/assignments/AssignmentStatusBadge';
import { getMySubmissions } from '../../services/submissionService';

const StudentSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getMySubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to load my submissions:', err);
      setError(err.response?.data?.message || 'Failed to load submission history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const title = sub.assignment?.title || '';
    const subject = sub.assignment?.subject || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase());

    const subStatus = sub.status === 'graded' ? 'evaluated' : sub.status;
    const matchesStatus = statusFilter === 'all' || subStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-7 h-7 text-brand-600" />
            <span>My Submissions</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Track your submitted coursework, files, evaluated marks, and faculty feedback.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignment title, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="late">Late</option>
            <option value="evaluated">Evaluated</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading your submissions..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold text-center">
          {error}
        </div>
      ) : filteredSubmissions.length > 0 ? (
        <Table headers={['Assignment & Subject', 'Faculty', 'Submitted On', 'Status', 'Marks', 'Action']}>
          {filteredSubmissions.map((sub) => {
            const subStatus = sub.status === 'graded' ? 'evaluated' : sub.status;
            return (
              <tr key={sub._id} className="hover:bg-slate-50 transition-colors text-xs">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <div>{sub.assignment?.title || 'Course Assignment'}</div>
                  <div className="text-[11px] text-brand-600 font-bold uppercase tracking-wider mt-0.5">
                    {sub.assignment?.subject}
                  </div>
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {sub.assignment?.faculty?.name || 'Faculty Member'}
                </td>

                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                  {new Date(sub.submittedAt).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <AssignmentStatusBadge status={subStatus} />
                </td>

                <td className="px-4 py-3 font-bold text-slate-900">
                  {subStatus === 'evaluated' ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      {sub.marks} / {sub.assignment?.totalMarks}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal italic">-</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <Link to={`/assignments/${sub.assignment?._id || sub.assignment}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      <span>View</span>
                    </Button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </Table>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
          <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-xs font-medium">No submissions found matching your filter.</p>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissionsPage;
