import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Plus, Search, Filter } from 'lucide-react';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getComplaints } from '../../services/complaintService';
import useAuth from '../../hooks/useAuth';

const CATEGORIES = ['all', 'academic', 'infrastructure', 'faculty', 'examination', 'fees', 'technical', 'hostel', 'library', 'other'];
const STATUSES = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];

const ComplaintsPage = () => {
  const { user } = useAuth();
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
      setError('Failed to load grievance records.');
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
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const canCreate = user?.role === 'student';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <AlertCircle className="w-7 h-7 text-brand-600" />
            <span>Campus Grievances & Redressal</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Submit issues, track status resolution, and view official administration responses.
          </p>
        </div>

        {canCreate && (
          <Link to="/complaints/create">
            <Button className="shadow-md shadow-brand-500/20">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>File Complaint</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search grievance title..."
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
        <LoadingSpinner size="lg" text="Loading grievances..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
          {error}
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((item) => (
            <ComplaintCard key={item._id} complaint={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Grievances Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no recorded grievances matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
