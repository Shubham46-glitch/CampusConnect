import React, { useState, useEffect } from 'react';
import { History, Search, Filter, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import API from '../../services/api';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        search: searchTerm,
        action: actionFilter,
      };

      const res = await API.get('/admin/logs', { params });

      setLogs(res.data?.logs || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (err) {
      console.error('Error fetching activity audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <History className="w-7 h-7 text-indigo-600" />
            <span>System Activity Audit Logs</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit trail of administrative, faculty, and security actions across CampusConnect.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchLogs} className="self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search log descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All System Actions</option>
            <option value="ASSIGNMENT_CREATED">ASSIGNMENT_CREATED</option>
            <option value="ANNOUNCEMENT_PUBLISHED">ANNOUNCEMENT_PUBLISHED</option>
            <option value="EVENT_CREATED">EVENT_CREATED</option>
            <option value="COMPLAINT_STATUS_UPDATED">COMPLAINT_STATUS_UPDATED</option>
            <option value="USER_STATUS_UPDATED">USER_STATUS_UPDATED</option>
            <option value="USER_DEPARTMENT_UPDATED">USER_DEPARTMENT_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading audit logs..." />
          </div>
        ) : logs.length > 0 ? (
          <>
            <Table headers={['Action Trigger', 'Performed By', 'User Role', 'Department', 'Activity Description', 'Timestamp']}>
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800 text-[11px]">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {log.performedBy?.name || 'System / Anonymous'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        log.performedBy?.role === 'admin'
                          ? 'danger'
                          : log.performedBy?.role === 'faculty'
                          ? 'indigo'
                          : 'primary'
                      }
                      className="capitalize text-[10px]"
                    >
                      {log.performedBy?.role || 'user'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.performedBy?.department || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {page} of {pages} ({total} audit log entries)
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
            No audit log entries recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsPage;
