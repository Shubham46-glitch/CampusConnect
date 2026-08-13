import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  BookOpen,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import {
  getAnalyticsOverview,
  getStudentsByDepartmentStats,
  getEventParticipationStats,
  getAssignmentSubmissionStats,
  getComplaintStatusStats,
  getUserRoleDistributionStats,
} from '../services/analyticsService';

const BRAND_COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [assignmentData, setAssignmentData] = useState(null);
  const [complaintData, setComplaintData] = useState(null);
  const [roleData, setRoleData] = useState([]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewRes,
        deptRes,
        eventRes,
        assignRes,
        complaintRes,
        roleRes,
      ] = await Promise.all([
        getAnalyticsOverview(),
        getStudentsByDepartmentStats(),
        getEventParticipationStats(),
        getAssignmentSubmissionStats(),
        getComplaintStatusStats(),
        getUserRoleDistributionStats(),
      ]);

      setOverview(overviewRes);
      setDepartmentData(deptRes || []);
      setEventData(eventRes || []);
      setAssignmentData(assignRes || null);
      setComplaintData(complaintRes || null);
      setRoleData(roleRes || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.response?.data?.message || 'Failed to load system analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Generating platform analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-4 max-w-lg mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-sm font-semibold text-rose-900">Analytics Load Error</h3>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllAnalytics} className="inline-flex items-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  // Format Assignment Submission data for Pie/Bar charts
  const submissionChartData = assignmentData?.submissions
    ? [
        { name: 'Submitted', value: assignmentData.submissions.submitted || 0, fill: '#2563eb' },
        { name: 'Graded', value: assignmentData.submissions.graded || 0, fill: '#10b981' },
        { name: 'Late', value: assignmentData.submissions.late || 0, fill: '#ef4444' },
      ].filter((item) => item.value > 0)
    : [];

  // Format Complaint Status data for Pie/Bar charts
  const complaintChartData = complaintData?.summary
    ? [
        { name: 'Pending', value: complaintData.summary.pending || 0, fill: '#ef4444' },
        { name: 'In Progress', value: complaintData.summary['in-progress'] || 0, fill: '#f59e0b' },
        { name: 'Resolved', value: complaintData.summary.resolved || 0, fill: '#10b981' },
      ].filter((item) => item.value > 0)
    : [];

  // Format User Role Distribution Data
  const formattedRoleData = roleData.map((item) => ({
    name: item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : 'Unknown',
    value: item.count,
  }));

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-brand-600" />
            <span>Platform Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time MongoDB aggregation metrics, department distributions, and event engagement.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllAnalytics}
          className="self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          icon={GraduationCap}
          color="brand"
          indicator="Enrolled students"
        />
        <DashboardCard
          title="Total Faculty"
          value={overview?.totalFaculty || 0}
          icon={Briefcase}
          color="indigo"
          indicator="Academic faculty"
        />
        <DashboardCard
          title="Total Events"
          value={overview?.totalEvents || 0}
          icon={Calendar}
          color="emerald"
          indicator="Campus activities"
        />
        <DashboardCard
          title="Assignments"
          value={overview?.totalAssignments || 0}
          icon={BookOpen}
          color="amber"
          indicator="Active coursework"
        />
        <DashboardCard
          title="Complaints"
          value={overview?.totalComplaints || 0}
          icon={AlertCircle}
          color="rose"
          indicator="Logged grievances"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Students by Department (BarChart) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Students by Department
            </h3>
            <span className="text-[11px] text-slate-400">Real MongoDB Records</span>
          </div>

          {departmentData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No department data available yet.
            </div>
          )}
        </div>

        {/* 2. User Role Distribution (PieChart) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              User Role Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Total: {overview?.totalUsers || 0}</span>
          </div>

          {formattedRoleData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formattedRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No user distribution data available.
            </div>
          )}
        </div>

        {/* 3. Event Registrations (BarChart) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Event Registrations & Capacity
            </h3>
            <span className="text-[11px] text-slate-400">Top Events</span>
          </div>

          {eventData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="registeredCount" fill="#10b981" radius={[4, 4, 0, 0]} name="Registered Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No event registration statistics available.
            </div>
          )}
        </div>

        {/* 4. Complaint Resolution Status (Pie/BarChart) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Grievance Status Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Complaints Workflow</span>
          </div>

          {complaintChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complaintChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No grievance records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
