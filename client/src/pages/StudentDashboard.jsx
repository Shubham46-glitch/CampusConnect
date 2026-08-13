import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, AlertCircle, Megaphone, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import ComplaintOverviewCard from '../components/ComplaintOverviewCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { getStudentDashboard } from '../services/dashboardService';
import useAuth from '../hooks/useAuth';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await getStudentDashboard();
      setData(dashboardStats);
    } catch (err) {
      console.error('Error loading student dashboard data', err);
      setError(err.response?.data?.message || 'Failed to load student dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student portal..." />
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
        <Button variant="outline" size="sm" onClick={fetchDashboardData} className="inline-flex items-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </Button>
      </div>
    );
  }

  const {
    upcomingEvents = 0,
    registeredEvents = 0,
    activeAssignments = 0,
    pendingAssignments = 0,
    myComplaints = 0,
    pendingComplaints = 0,
    recentAnnouncements = [],
    pendingAssignmentsList = [],
    upcomingEventsList = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {getGreeting()}, {user?.name || 'Student'} 👋 • Department of {user?.department || 'Computer Science'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          className="self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <DashboardCard
          title="Upcoming Events"
          value={upcomingEvents}
          icon={Calendar}
          color="brand"
          indicator="Campus activities"
        />
        <DashboardCard
          title="Registered Events"
          value={registeredEvents}
          icon={CheckCircle2}
          color="emerald"
          indicator="Joined events"
        />
        <DashboardCard
          title="Active Assignments"
          value={activeAssignments}
          icon={BookOpen}
          color="indigo"
          indicator="Coursework assigned"
        />
        <DashboardCard
          title="Pending Submissions"
          value={pendingAssignments}
          icon={Clock}
          color="amber"
          indicator={`${pendingAssignments} awaiting submission`}
        />
      </div>

      {/* Main Content Grid: Coursework Assignments & Complaints Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Assignments Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Pending Coursework Assignments</span>
            </h3>
            <Link to="/assignments" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>

          {pendingAssignmentsList.length > 0 ? (
            <Table headers={['Assignment Title', 'Subject', 'Due Date', 'Total Marks', 'Action']}>
              {pendingAssignmentsList.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-slate-600">{item.subject}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{item.totalMarks} Marks</td>
                  <td className="px-4 py-3">
                    <Link to={`/assignments/${item._id}`}>
                      <Button size="sm" variant="primary">
                        Submit Work
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No pending assignments due at this time.
            </div>
          )}
        </div>

        {/* Complaints Overview */}
        <div className="lg:col-span-1">
          <ComplaintOverviewCard
            pending={pendingComplaints}
            inProgress={0}
            resolved={myComplaints - pendingComplaints}
            total={myComplaints}
            linkPath="/complaints"
          />
        </div>
      </div>

      {/* Noticeboard & Upcoming Events Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Noticeboard Updates */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-brand-600" />
              <span>Latest Noticeboard Updates</span>
            </h3>
            <Link to="/announcements" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.slice(0, 3).map((item) => (
                <div key={item._id} className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.content}</p>
                  </div>
                  <Badge variant={item.priority === 'high' ? 'danger' : 'primary'} className="capitalize shrink-0">
                    {item.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No noticeboard updates posted.</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Upcoming Campus Events</span>
            </h3>
            <Link to="/events" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingEventsList.length > 0 ? (
              upcomingEventsList.slice(0, 3).map((item) => (
                <div key={item._id} className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.venue}</p>
                  </div>
                  <Badge variant="emerald" className="shrink-0">
                    {new Date(item.date).toLocaleDateString()}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No upcoming campus events scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
