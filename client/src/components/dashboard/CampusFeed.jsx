import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Calendar, Sparkles, ArrowRight } from 'lucide-react';

const CampusFeed = ({ announcements = [], events = [] }) => {
  // Combine announcements and events into a chronological activity feed
  const feedItems = [
    ...announcements.map((a) => ({
      id: a._id,
      type: 'announcement',
      title: a.title,
      subtitle: a.content,
      date: new Date(a.publishedAt || a.createdAt),
      link: `/announcements/${a._id}`,
      badge: a.priority || 'Notice',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-100',
      icon: Megaphone,
      iconColor: 'bg-purple-500 text-white',
    })),
    ...events.map((e) => ({
      id: e._id,
      type: 'event',
      title: e.title,
      subtitle: `${e.venue ? e.venue + ' · ' : ''}${e.time || 'Campus Event'}`,
      date: new Date(e.date || e.createdAt),
      link: `/events/${e._id}`,
      badge: 'Campus Event',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Calendar,
      iconColor: 'bg-emerald-500 text-white',
    })),
  ].sort((a, b) => b.date - a.date).slice(0, 4);

  if (feedItems.length === 0) {
    return (
      <div className="py-8 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <Sparkles className="w-6 h-6 text-brand-500 mx-auto" />
        <p className="text-xs font-bold text-slate-700">No recent activity</p>
        <p className="text-[11px] text-slate-400">Campus feeds will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {feedItems.map((item, idx) => {
          const Icon = item.icon;
          const isToday = new Date().toDateString() === item.date.toDateString();

          return (
            <div key={item.id + idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-4 top-3 w-3 h-3 rounded-full bg-white border-2 border-brand-500 shadow-xs group-hover:scale-125 transition-transform" />

              <Link
                to={item.link}
                className="block p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-xs hover:shadow-md transition-all duration-200 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <span>{isToday ? '● TODAY' : item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </span>

                  <span className={`px-2 py-0.5 border text-[10px] font-extrabold rounded-md ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl text-white shrink-0 ${item.iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampusFeed;
