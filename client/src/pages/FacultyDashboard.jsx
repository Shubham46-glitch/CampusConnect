import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Megaphone, CheckSquare, RefreshCw, FileText, AlertCircle, Eye } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import ComplaintOverviewCard from '../components/ComplaintOverviewCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { getFacultyDashboard } from '../services/dashboardService';
import useAuth from '../hooks/useAuth';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getFacultyDashboard();
      setData(stats);
    } catch (err) {
      console.error('Error fetching faculty dashboard data', err);
      setError(err.response?.data?.message || 'Failed to load faculty dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading faculty portal..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-4 max-w-lg mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-sm font-semibold text-rose-900">Dashboard Loading Error</h3>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchFacultyData} className="inline-flex items-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </Button>
      </div>
    );
  }

  const {
    eventsCreated = 0,
    activeAssignments = 0,
    totalSubmissions = 0,
    pendingGrading = 0,
    announcementsPublished = 0,
    studentComplaints = 0,
    pendingSubmissionsList = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {getGreeting()}, Prof. {user?.name || 'Faculty'} 👋 • Department of {user?.department || 'Academic Affairs'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchFacultyData}
          className="self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <DashboardCard
          title="Events Created"
          value={eventsCreated}
          icon={Calendar}
          color="indigo"
          indicator="Managed events"
        />
        <DashboardCard
          title="Active Assignments"
          value={activeAssignments}
          icon={BookOpen}
          color="amber"
          indicator="Active coursework"
        />
        <DashboardCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={FileText}
          color="brand"
          indicator="Student submissions"
        />
        <DashboardCard
          title="Pending Evaluation"
          value={pendingGrading}
          icon={CheckSquare}
          color="rose"
          indicator={`${pendingGrading} awaiting review`}
        />
      </div>

      {/* Main Content Grid: Evaluation Queue Table & Complaints Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Awaiting Grading */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-rose-600" />
              <span>Submissions Awaiting Evaluation</span>
            </h3>
            <Link to="/assignments" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>

          {pendingSubmissionsList.length > 0 ? (
            <Table headers={['Assignment Title', 'Student Name', 'Submitted Date', 'Status', 'Action']}>
              {pendingSubmissionsList.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.assignment?.title || 'Assignment'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-medium text-slate-800">{item.student?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.student?.department}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === 'late' ? 'danger' : 'warning'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/assignments/${item.assignment?._id}/submissions`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Evaluate</span>
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              All student submissions have been evaluated.
            </div>
          )}
        </div>

        {/* Complaints Overview */}
        <div className="lg:col-span-1">
          <ComplaintOverviewCard
            pending={studentComplaints}
            inProgress={0}
            resolved={0}
            total={studentComplaints}
            linkPath="/events"
          />
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Published Announcements ({announcementsPublished})</span>
            </h3>
            <Link to="/announcements" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Track and publish notices for department students and academic classes.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Active Course Assignments ({activeAssignments})</span>
            </h3>
            <Link to="/assignments" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Manage course deadlines, submissions, and student evaluation progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
