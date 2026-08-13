import React from 'react';

const AssignmentStatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-rose-50 text-rose-700 border-rose-200',
    archived: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    late: 'bg-amber-50 text-amber-700 border-amber-200',
    graded: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
        styles[status] || styles.active
      }`}
    >
      {status}
    </span>
  );
};

export default AssignmentStatusBadge;
