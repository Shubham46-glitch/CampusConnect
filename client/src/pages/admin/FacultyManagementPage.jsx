import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, RefreshCw, AlertCircle, Building2 } from 'lucide-react';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { DEPARTMENTS } from '../../constants/departments';
import axios from 'axios';

const FacultyManagementPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Department Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDeptModalOpen, setEditDeptModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter,
      };

      const res = await axios.get('/api/users/faculty', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setFaculty(res.data.users || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching faculty roster:', err);
      setError(err.response?.data?.message || 'Failed to load faculty roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [page, departmentFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFaculty();
  };

  const handleStatusToggle = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const targetStatus = user.status === 'active' ? 'inactive' : 'active';
      await axios.patch(
        `/api/users/${user._id}/status`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update faculty status');
    }
  };

  const handleOpenDeptModal = (user) => {
    setSelectedUser(user);
    setNewDepartment(user.department || DEPARTMENTS[0]);
    setEditDeptModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    if (!selectedUser || !newDepartment) return;
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/users/${selectedUser._id}/department`,
        { department: newDepartment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDeptModalOpen(false);
      setSelectedUser(null);
      fetchFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update faculty department');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            <span>Faculty Roster & Department Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Institutional overview of professors, lecturers, department assignments, and account statuses.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchFaculty} className="self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty by name, email, employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading faculty list..." />
          </div>
        ) : faculty.length > 0 ? (
          <>
            <Table headers={['Faculty Name', 'Email', 'Department', 'Employee ID', 'Status', 'Actions']}>
              {faculty.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3 font-medium text-indigo-700">{u.department}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {u.profileInfo?.employeeId || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'active' ? 'success' : 'danger'} className="capitalize">
                      {u.status || 'active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenDeptModal(u)}
                      className="text-[11px]"
                    >
                      Change Dept
                    </Button>
                    <Button
                      variant={u.status === 'active' ? 'outline' : 'primary'}
                      size="xs"
                      onClick={() => handleStatusToggle(u)}
                      className="text-[11px]"
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {page} of {pages} ({total} total faculty members)
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No faculty members match your criteria.
          </div>
        )}
      </div>

      {/* Edit Department Modal */}
      <Modal
        isOpen={editDeptModalOpen}
        onClose={() => setEditDeptModalOpen(false)}
        title={`Reassign Department — ${selectedUser?.name}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select the new academic department to reassign <strong>{selectedUser?.name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setEditDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveDepartment} disabled={updating}>
              {updating ? 'Saving...' : 'Update Department'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyManagementPage;
