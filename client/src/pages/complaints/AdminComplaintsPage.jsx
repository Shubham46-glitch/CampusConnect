import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, Filter, Eye } from 'lucide-react';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { getComplaints } from '../../services/complaintService';

const CATEGORIES = ['all', 'academic', 'infrastructure', 'faculty', 'examination', 'fees', 'technical', 'hostel', 'library', 'other'];
const STATUSES = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch institutional complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Shield className="w-7 h-7 text-indigo-600" />
            <span>Admin Grievance Control Center</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Review institutional grievances, assign handlers, update status workflows, and record official resolutions.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, student name, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-36 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading grievances roster..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {filteredComplaints.length > 0 ? (
            <Table headers={['Grievance Title', 'Student / Dept', 'Category', 'Priority', 'Status', 'Assigned To', 'Actions']}>
              {filteredComplaints.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <Link to={`/complaints/${item._id}`} className="hover:text-brand-600 transition-colors">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    <div>{item.submittedBy?.name || 'Student'}</div>
                    <div className="text-slate-400 font-mono">{item.department}</div>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600">{item.category}</td>
                  <td className="px-4 py-3">
                    <Badge variant="indigo" className="capitalize text-[10px]">
                      {item.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ComplaintStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {item.assignedTo?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/complaints/${item._id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Manage</span>
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No complaint records found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminComplaintsPage;
