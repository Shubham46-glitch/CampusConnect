import React, { useState, useEffect } from 'react';
import { Building2, Users, GraduationCap, UserCheck, RefreshCw, AlertCircle, Search, Filter } from 'lucide-react';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { DEPARTMENTS } from '../../constants/departments';
import axios from 'axios';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Department Filter
  const [selectedDept, setSelectedDept] = useState('all');
  const [viewTab, setViewTab] = useState('students'); // 'students' or 'faculty'

  // Detailed Users Roster State for Selected Department
  const [rosterUsers, setRosterUsers] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.response?.data?.message || 'Failed to load department statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentUsers = async () => {
    try {
      setRosterLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = viewTab === 'students' ? '/api/users/students' : '/api/users/faculty';
      const params = {
        limit: 50,
        search: searchTerm,
        department: selectedDept,
      };

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRosterUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching department user roster:', err);
    } finally {
      setRosterLoading(false);
    }

  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDepartmentUsers();
  }, [selectedDept, viewTab]);

  const activeDeptObj = departments.find((d) => d.name === selectedDept) || {
    name: 'All Departments',
    studentsCount: departments.reduce((acc, curr) => acc + (curr.studentsCount || 0), 0),
    facultyCount: departments.reduce((acc, curr) => acc + (curr.facultyCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading department analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-4 max-w-lg mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-sm font-semibold text-rose-900">Error Loading Departments</h3>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDepartments} className="inline-flex items-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-7 h-7 text-brand-600" />
            <span>Academic Department Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Institution-wide overview of departments, student rosters, and faculty assignments across college disciplines.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchDepartments} className="self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Department Selection Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Department Overview</span>
          {selectedDept !== 'all' && (
            <button
              onClick={() => setSelectedDept('all')}
              className="text-xs text-brand-600 font-semibold hover:underline"
            >
              Reset to All Departments
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              selectedDept === 'all'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {DEPARTMENTS.map((deptName) => (
            <button
              key={deptName}
              onClick={() => setSelectedDept(deptName)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedDept === deptName
                  ? 'bg-brand-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {deptName}
            </button>
          ))}
        </div>
      </div>

      {/* Department Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Discipline</span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{activeDeptObj.name}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enrolled Students</span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeDeptObj.studentsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Faculty Members</span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeDeptObj.facultyCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Department Roster Table View (Students vs Faculty) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>
                {selectedDept === 'all' ? 'Institution-Wide' : selectedDept} Roster
              </span>
            </h3>

            {/* View Switcher Tabs */}
            <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
              <button
                onClick={() => setViewTab('students')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewTab === 'students' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Students ({activeDeptObj.studentsCount || 0})
              </button>
              <button
                onClick={() => setViewTab('faculty')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewTab === 'faculty' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Faculty ({activeDeptObj.facultyCount || 0})
              </button>
            </div>
          </div>

          {/* Search Box inside Roster */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${viewTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDepartmentUsers()}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {rosterLoading ? (
          <div className="py-8">
            <LoadingSpinner size="md" text={`Loading ${viewTab}...`} />
          </div>
        ) : rosterUsers.length > 0 ? (
          <Table
            headers={
              viewTab === 'students'
                ? ['Student Name', 'Email Address', 'Department', 'Roll Number', 'Status']
                : ['Faculty Name', 'Email Address', 'Department', 'Employee ID', 'Status']
            }
          >
            {rosterUsers.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                <td className="px-4 py-3 font-medium text-brand-700">{u.department || 'Institution-Wide'}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                  {viewTab === 'students' ? u.profileInfo?.rollNumber || 'N/A' : u.profileInfo?.employeeId || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === 'active' ? 'success' : 'danger'} className="capitalize">
                    {u.status || 'active'}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
            No {viewTab} registered in {selectedDept === 'all' ? 'the institution' : selectedDept}.
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagementPage;
