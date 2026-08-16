import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, BookOpen, AlertCircle, Megaphone, ShieldAlert, RefreshCw, Eye, Building2 } from 'lucide-react';

import DashboardCard from '../components/DashboardCard';
import ComplaintOverviewCard from '../components/ComplaintOverviewCard';
import Table from '../components/Table';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { getAdminDashboard } from '../services/dashboardService';
import { getAdminAttendanceAnalytics } from '../services/attendanceService';
import { getDepartments } from '../services/academicService';
import useAuth from '../hooks/useAuth';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [departmentCount, setDepartmentCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stats, attStats, depts] = await Promise.all([
        getAdminDashboard(),
        getAdminAttendanceAnalytics().catch(() => null),
        getDepartments().catch(() => []),
      ]);
      setData(stats);
      setAttendanceData(attStats);
      if (depts && depts.length > 0) setDepartmentCount(depts.length);
    } catch (err) {
      console.error('Error fetching admin dashboard data', err);
      setError(err.response?.data?.message || 'Failed to load admin dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin console..." />
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
        <Button variant="outline" size="sm" onClick={fetchAdminData} className="inline-flex items-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </Button>
      </div>
    );
  }

  const {
    totalUsers = 0,
    totalStudents = 0,
    totalFaculty = 0,
    totalEvents = 0,
    totalAnnouncements = 0,
    totalAssignments = 0,
    recentUsers = [],
    recentComplaints = [],
  } = data || {};

  const complaintStats = data?.complaintStats || {
    pending: data?.pendingComplaints || 0,
    inProgress: data?.inProgressComplaints || 0,
    resolved: data?.resolvedComplaints || 0,
    total: data?.totalComplaints || 0,
  };

  const overallAttendancePct = attendanceData?.overallPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">System Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            {getGreeting()}, {user?.name || 'Administrator'} 👋 • Institutional Administration
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/admin/attendance-analytics">
            <Button variant="primary" size="sm">
              <Building2 className="w-4 h-4 mr-1" /> Attendance Analytics
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 5 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="brand"
          indicator={`${totalStudents} Student • ${totalFaculty} Faculty`}
        />
        <DashboardCard
          title="Academic Departments"
          value={departmentCount}
          icon={Building2}
          color="indigo"
          indicator="Database departments"
        />
        <DashboardCard
          title="Overall Attendance"
          value={`${overallAttendancePct}%`}
          icon={Building2}
          color="emerald"
          indicator="Institution-wide average"
        />
        <DashboardCard
          title="Total Events"
          value={totalEvents}
          icon={Calendar}
          color="amber"
          indicator="Campus activities"
        />
        <DashboardCard
          title="Total Complaints"
          value={complaintStats.total}
          icon={ShieldAlert}
          color="rose"
          indicator={`${complaintStats.pending} pending resolution`}
        />
      </div>

      {/* Main Content Grid: Recent Registrations & Complaints Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Recent User Registrations</span>
            </h3>
          </div>

          {recentUsers.length > 0 ? (
            <Table headers={['User Name', 'Email', 'Role', 'Department', 'Joined Date']}>
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'faculty' ? 'indigo' : 'primary'} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.department || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
              No recent registration records.
            </div>
          )}
        </div>

        {/* Complaints Overview */}
        <div className="lg:col-span-1">
          <ComplaintOverviewCard
            pending={complaintStats.pending}
            inProgress={complaintStats.inProgress}
            resolved={complaintStats.resolved}
            total={complaintStats.total}
            linkPath="/admin/complaints"
          />
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Campus Announcements ({totalAnnouncements})</span>
            </h3>
            <Link to="/announcements" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Monitor and manage official campus-wide announcements and noticeboards.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Campus Events ({totalEvents})</span>
            </h3>
            <Link to="/events" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Academic workshops, technical symposiums, and institutional activities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
