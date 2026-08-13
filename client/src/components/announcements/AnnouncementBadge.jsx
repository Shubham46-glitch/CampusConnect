import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[priority] || styles.medium}`}>
      {priority} priority
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const styles = {
    urgent: 'bg-rose-100 text-rose-800',
    academic: 'bg-brand-50 text-brand-700',
    examination: 'bg-purple-50 text-purple-700',
    placement: 'bg-emerald-50 text-emerald-700',
    event: 'bg-indigo-50 text-indigo-700',
    general: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${styles[category] || styles.general}`}>
      {category}
    </span>
  );
};
