import React from 'react';
import { Bell, CheckCheck, Clock, Calendar, BookOpen, AlertCircle, Megaphone, Info } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'attendance':
      return <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />;
    case 'event':
      return <Calendar className="w-3.5 h-3.5 text-brand-600" />;
    case 'assignment':
      return <BookOpen className="w-3.5 h-3.5 text-amber-600" />;
    case 'complaint':
      return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
    case 'announcement':
      return <Megaphone className="w-3.5 h-3.5 text-indigo-600" />;
    default:
      return <Info className="w-3.5 h-3.5 text-slate-500" />;
  }
};

const NotificationDropdown = ({
  notifications = [],
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden select-none">
      {/* Panel Header */}
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-3.5 h-3.5 text-brand-600" />
          <h3 className="text-xs font-semibold text-slate-900">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-semibold rounded border border-brand-200/60">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-medium text-brand-600 hover:text-brand-700 flex items-center space-x-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List Content */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner size="sm" text="Loading notifications..." />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => !item.isRead && onMarkRead(item._id)}
              className={`p-3 flex items-start space-x-3 transition-colors cursor-pointer ${
                item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-brand-50/30 hover:bg-brand-50/60'
              }`}
            >
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200/60 shrink-0 mt-0.5">
                {getTypeIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs ${item.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-semibold'} truncate`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {!item.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-1.5" title="Unread" />
              )}
            </div>
          ))
        ) : (
          <div className="py-10 text-center space-y-2">
            <Bell className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-700">No new notifications</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              You're all caught up! Updates regarding events, assignments, and grievances will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
