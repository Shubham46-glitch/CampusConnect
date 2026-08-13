import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User, AlertCircle, MessageSquare, CheckCircle2, UserCheck } from 'lucide-react';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import ComplaintAdminPanel from '../../components/complaints/ComplaintAdminPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { getComplaintById, deleteComplaint, updateComplaintStatus, assignComplaint } from '../../services/complaintService';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const data = await getComplaintById(id);
      setComplaint(data);

      if (user?.role === 'admin') {
        try {
          const res = await API.get('/users');
          const admins = res.data.filter((u) => u.role === 'admin');
          setAdminUsers(admins);
        } catch (uErr) {
          // ignore user fetch error if not available
        }
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found or access forbidden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id, user]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        setDeleteLoading(true);
        await deleteComplaint(id);
        navigate(user?.role === 'admin' ? '/admin/complaints' : '/complaints');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete complaint');
        setDeleteLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (statusData) => {
    try {
      setAdminActionLoading(true);
      await updateComplaintStatus(id, statusData);
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleAssign = async (assignedToId) => {
    try {
      setAdminActionLoading(true);
      await assignComplaint(id, assignedToId);
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading grievance details..." />;
  }

  if (error || !complaint) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl inline-block text-xs font-semibold">
          {error || 'Complaint not found'}
        </div>
        <div>
          <Link to={user?.role === 'admin' ? '/admin/complaints' : '/complaints'}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Grievances
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = complaint.submittedBy?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const isPending = complaint.status === 'pending';
  const canEditDeleteStudent = isOwner && isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={isAdmin ? '/admin/complaints' : '/complaints'}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Grievances</span>
        </Link>

        {(canEditDeleteStudent || isAdmin) && (
          <div className="flex items-center space-x-2">
            {canEditDeleteStudent && (
              <Link to={`/complaints/${complaint._id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </Link>
            )}
            <Button variant="danger" size="sm" disabled={deleteLoading} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Grievance Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-md capitalize">
                {complaint.category}
              </span>
              <ComplaintStatusBadge status={complaint.status} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{complaint.title}</h1>
          </div>

          <Badge variant="indigo" className="capitalize text-xs">
            Priority: {complaint.priority}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Submitted By</span>
            <p className="font-bold text-slate-800 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
              {complaint.submittedBy?.name || 'Student'} ({complaint.submittedBy?.department})
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Submitted Date</span>
            <p className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Assigned Handler</span>
            <p className="font-bold text-slate-800 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              {complaint.assignedTo?.name || 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Complaint Details</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{complaint.description}</p>
        </div>

        {/* Admin Response Box */}
        {complaint.adminResponse && (
          <div className="p-5 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-2">
            <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Official Administration Response</span>
            </h4>
            <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-line font-medium">
              "{complaint.adminResponse}"
            </p>
            {complaint.resolvedAt && (
              <p className="text-[11px] text-indigo-600 font-semibold pt-1">
                Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Admin Management Panel */}
      {isAdmin && (
        <ComplaintAdminPanel
          complaint={complaint}
          adminUsers={adminUsers}
          onStatusUpdate={handleStatusUpdate}
          onAssign={handleAssign}
          loading={adminActionLoading}
        />
      )}
    </div>
  );
};

export default ComplaintDetailsPage;
