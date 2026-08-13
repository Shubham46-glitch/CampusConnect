import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, User, ChevronRight, MessageSquare } from 'lucide-react';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import Badge from '../Badge';

const ComplaintCard = ({ complaint }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md capitalize">
            {complaint.category}
          </span>
          <ComplaintStatusBadge status={complaint.status} />
        </div>

        <Link to={`/complaints/${complaint._id}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
            {complaint.title}
          </h3>
        </Link>

        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {complaint.adminResponse && (
          <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="line-clamp-1 italic">"{complaint.adminResponse}"</p>
          </div>
        )}
      </div>

      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {complaint.department}
          </Badge>
          <Link
            to={`/complaints/${complaint._id}`}
            className="p-1 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
            title="View Details"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
