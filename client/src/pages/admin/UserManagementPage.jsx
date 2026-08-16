import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Mail,
  Building2,
  Hash,
  CreditCard,
  Calendar,
} from 'lucide-react';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  fetchStudents,
  fetchFaculty,
  updateUserStatus,
} from '../../services/userService';

import { DEPARTMENTS as APP_DEPARTMENTS } from '../../constants/departments';

const DEPARTMENTS = ['All Departments', ...APP_DEPARTMENTS];


const UserManagementPage = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'faculty'

  // Query & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Data states
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null); // Details modal
  const [statusModalUser, setStatusModalUser] = useState(null); // Confirmation modal
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm,
        department: selectedDept === 'All Departments' ? '' : selectedDept,
        division: selectedDivision === 'All Divisions' ? '' : selectedDivision,
        status: selectedStatus,
        page,
        limit,
      };

      let res;
      if (activeTab === 'students') {
        res = await fetchStudents(params);
      } else {
        res = await fetchFaculty(params);
      }

      setData(res || { users: [], total: 0, pages: 1 });
    } catch (err) {
      console.error('Error loading user roster:', err);
      setError(err.response?.data?.message || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, page, selectedDept, selectedDivision, selectedStatus]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchTerm('');
    setSelectedDept('All Departments');
    setSelectedStatus('all');
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusModalUser) return;
    try {
      setActionLoading(true);
      const newStatus = statusModalUser.status === 'inactive' ? 'active' : 'inactive';
      await updateUserStatus(statusModalUser._id, newStatus);
      setStatusModalUser(null);
      await loadData();
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-7 h-7 text-brand-600" />
            <span>User Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Institutional user directory, role rosters, and account status management.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => handleTabChange('students')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors ${
              activeTab === 'students'
                ? 'bg-brand-50 text-brand-700 shadow-2xs border border-brand-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students Roster</span>
          </button>

          <button
            onClick={() => handleTabChange('faculty')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors ${
              activeTab === 'faculty'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Faculty Roster</span>
          </button>
        </div>

        {/* Search Input & Select Filters */}
        <div className={`grid grid-cols-1 ${activeTab === 'students' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Division Filter (Student Tab Only) */}
          {activeTab === 'students' && (
            <div>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
              >
                <option value="All Divisions">All Divisions</option>
                <option value="D1">Division 1 (D1)</option>
                <option value="D2">Division 2 (D2)</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Roster Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-white rounded-xl border border-slate-200/80">
          <LoadingSpinner size="md" text={`Loading ${activeTab}...`} />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs font-semibold text-rose-900">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Table
            headers={
              activeTab === 'students'
                ? ['Student Name', 'Email', 'Department', 'Division / Class', 'Roll Number', 'Status', 'Registered Date', 'Actions']
                : ['Faculty Name', 'Email', 'Department', 'Employee ID', 'Status', 'Registered Date', 'Actions']
            }
          >
            {data.users.length > 0 ? (
              data.users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.department || 'Computer Science'}</td>
                  {activeTab === 'students' && (
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <Badge variant="indigo" className="text-[11px] font-mono">
                        {u.division || u.academicClass?.name || 'D1'}
                      </Badge>
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {activeTab === 'students'
                      ? u.profileInfo?.rollNumber || 'N/A'
                      : u.profileInfo?.employeeId || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'inactive' ? 'danger' : 'emerald'}>
                      {u.status === 'inactive' ? 'Inactive' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(u)}
                        title="View user details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={u.status === 'inactive' ? 'success' : 'secondary'}
                        onClick={() => setStatusModalUser(u)}
                        title={u.status === 'inactive' ? 'Activate account' : 'Deactivate account'}
                      >
                        {u.status === 'inactive' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>Deactivate</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                  No {activeTab} accounts match your search or filter criteria.
                </td>
              </tr>
            )}
          </Table>

          {/* Pagination Controls */}
          {data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs">
              <span className="text-slate-500 font-medium">
                Showing {Math.min((page - 1) * limit + 1, data.total)}–
                {Math.min(page * limit, data.total)} of {data.total} {activeTab}
              </span>

              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>

                <div className="px-3 text-xs font-semibold text-slate-700">
                  Page {page} of {data.pages}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  User Credentials & Profile
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold text-base flex items-center justify-center uppercase shrink-0">
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedUser.name}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Badge variant={selectedUser.role === 'faculty' ? 'indigo' : 'primary'} className="capitalize">
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.status === 'inactive' ? 'danger' : 'emerald'}>
                      {selectedUser.status || 'active'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">{selectedUser.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Department of {selectedUser.department || 'Computer Science'}</span>
                </div>

                {selectedUser.role === 'student' ? (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">
                      Roll Number: {selectedUser.profileInfo?.rollNumber || 'N/A'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">
                      Employee ID: {selectedUser.profileInfo?.employeeId || 'N/A'}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Registered: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Confirmation Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 select-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-amber-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">
                Confirm Account Status Update
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to{' '}
              <strong className="text-slate-900">
                {statusModalUser.status === 'inactive' ? 'activate' : 'deactivate'}
              </strong>{' '}
              the account for <strong className="text-slate-900">{statusModalUser.name}</strong>?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusModalUser(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={statusModalUser.status === 'inactive' ? 'success' : 'danger'}
                onClick={handleConfirmStatusToggle}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
