import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Calendar } from 'lucide-react';

const AnnouncementCard = ({ announcement }) => {
  if (!announcement) return null;

  const priorityColor =
    announcement.priority === 'high'
      ? 'bg-rose-50 text-rose-700 border-rose-100'
      : announcement.priority === 'medium'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-blue-50 text-blue-700 border-blue-100';

  const publishedDate = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleDateString()
    : new Date(announcement.createdAt).toLocaleDateString();

  return (
    <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all hover:bg-slate-50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
          {announcement.title}
        </h4>
        <span className={`px-2 py-0.5 border text-[10px] font-extrabold rounded-md capitalize shrink-0 ${priorityColor}`}>
          {announcement.priority || 'General'}
        </span>
      </div>

      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
        {announcement.content}
      </p>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
        <span className="flex items-center space-x-1">
          <Calendar className="w-2.5 h-2.5" />
          <span>{publishedDate}</span>
        </span>

        <Link
          to={`/announcements/${announcement._id}`}
          className="font-bold text-brand-600 hover:underline"
        >
          Read full notice →
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementCard;
