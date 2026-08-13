import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Megaphone, AlertCircle } from 'lucide-react';

const QuickActionsBar = () => {
  const actions = [
    {
      title: 'Events',
      subtitle: 'Campus Activities',
      path: '/events',
      icon: Calendar,
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/25',
      hoverBorder: 'hover:border-emerald-300',
    },
    {
      title: 'Assignments',
      subtitle: 'Coursework Work',
      path: '/assignments',
      icon: BookOpen,
      iconBg: 'bg-brand-600 text-white shadow-brand-500/25',
      hoverBorder: 'hover:border-brand-300',
    },
    {
      title: 'Noticeboard',
      subtitle: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
      iconBg: 'bg-purple-600 text-white shadow-purple-500/25',
      hoverBorder: 'hover:border-purple-300',
    },
    {
      title: 'Complaints',
      subtitle: 'Submit Grievance',
      path: '/complaints/create',
      icon: AlertCircle,
      iconBg: 'bg-rose-500 text-white shadow-rose-500/25',
      hoverBorder: 'hover:border-rose-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.title}
            to={act.path}
            className={`p-4 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex items-center space-x-3.5 group ${act.hoverBorder}`}
          >
            <div className={`p-2.5 rounded-xl text-white shadow-md transition-transform duration-200 group-hover:scale-110 ${act.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-black text-slate-900 group-hover:text-brand-600 transition-colors block truncate">
                {act.title}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block truncate">
                {act.subtitle}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActionsBar;
