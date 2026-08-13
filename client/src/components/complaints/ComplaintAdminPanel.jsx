import React, { useState } from 'react';
import Button from '../Button';
import { Shield, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const ComplaintAdminPanel = ({ complaint, adminUsers = [], onStatusUpdate, onAssign, loading }) => {
  const [status, setStatus] = useState(complaint?.status || 'pending');
  const [adminResponse, setAdminResponse] = useState(complaint?.adminResponse || '');
  const [assignedTo, setAssignedTo] = useState(complaint?.assignedTo?._id || '');
  const [msg, setMsg] = useState('');

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    await onStatusUpdate({ status, adminResponse });
    setMsg('Status updated successfully!');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    await onAssign(assignedTo);
    setMsg('Assigned successfully!');
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
        <Shield className="w-5 h-5 text-brand-400" />
        <h3 className="text-base font-bold text-white">Admin Grievance Control Panel</h3>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl">
          ✓ {msg}
        </div>
      )}

      {/* Status & Response Form */}
      <form onSubmit={handleStatusSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Update Complaint Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Official Admin Response / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Provide official update or resolution summary..."
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            <span>Update Status & Response</span>
          </Button>
        </div>
      </form>

      {/* Assignment Control */}
      {adminUsers.length > 0 && (
        <form onSubmit={handleAssignSubmit} className="pt-4 border-t border-slate-800 space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Assign Grievance Handler
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">-- Unassigned --</option>
              {adminUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="secondary" disabled={loading} size="sm">
              <UserCheck className="w-4 h-4 mr-1" />
              <span>Save Assignment</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComplaintAdminPanel;
