import React from 'react';

const EventStatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: { label: 'Upcoming', style: 'bg-sky-50 text-sky-700 border-sky-200' },
    ongoing: { label: 'Ongoing', style: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' },
    completed: { label: 'Completed', style: 'bg-slate-100 text-slate-600 border-slate-200' },
    cancelled: { label: 'Cancelled', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.style}`}>
      {config.label}
    </span>
  );
};

export default EventStatusBadge;
