import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Calendar, User, Clock, ChevronRight, Target } from 'lucide-react';
import { CategoryBadge, PriorityBadge } from './AnnouncementBadge';
import Badge from '../Badge';

const AnnouncementCard = ({ announcement }) => {
  const isExpired = announcement.status === 'expired' || (announcement.expiresAt && new Date(announcement.expiresAt) < new Date());

  return (
    <div className={`bg-white rounded-2xl border ${isExpired ? 'border-slate-200 opacity-75' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden`}>
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={announcement.category} />
          <PriorityBadge priority={announcement.priority} />
        </div>

        <Link to={`/announcements/${announcement._id}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
            {announcement.title}
          </h3>
        </Link>

        <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
          {announcement.content}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="indigo" className="text-[10px] capitalize">
            Target: {announcement.targetAudience} {announcement.targetAudience === 'department' ? `(${announcement.department})` : ''}
          </Badge>
          {isExpired && (
            <Badge variant="danger" className="text-[10px]">
              Expired Notice
            </Badge>
          )}
        </div>
      </div>

      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">{announcement.publishedBy?.name || 'College Admin'}</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400">
            {new Date(announcement.createdAt).toLocaleDateString()}
          </span>
          <Link
            to={`/announcements/${announcement._id}`}
            className="p-1 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
            title="Read Full Announcement"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
