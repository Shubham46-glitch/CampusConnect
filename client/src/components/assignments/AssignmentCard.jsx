import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Award, User, ChevronRight, FileText } from 'lucide-react';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import Badge from '../Badge';
import useAuth from '../../hooks/useAuth';

const AssignmentCard = ({ assignment }) => {
  const { user } = useAuth();
  const isCreator = assignment.faculty?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canManage = isCreator || isAdmin;

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              {assignment.subject}
            </span>
            {assignment.section && assignment.section !== 'All Divisions' && assignment.section !== 'All' ? (
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {assignment.section}
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                All Divisions
              </span>
            )}
          </div>
          <AssignmentStatusBadge status={isOverdue && assignment.status === 'active' ? 'closed' : assignment.status} />
        </div>

        <Link to={`/assignments/${assignment._id}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
            {assignment.title}
          </h3>
        </Link>

        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
          {assignment.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>Due: <strong>{new Date(assignment.dueDate).toLocaleDateString()}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-500">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span><strong>{assignment.totalMarks}</strong> Marks</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">{assignment.faculty?.name || 'Faculty'}</span>
        </div>

        <div className="flex items-center space-x-2">
          {canManage && (
            <Link
              to={`/assignments/${assignment._id}/submissions`}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 text-brand-700 hover:text-brand-800 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
            >
              <FileText className="w-3 h-3 mr-1" />
              <span>Submissions</span>
            </Link>
          )}

          <Link
            to={`/assignments/${assignment._id}`}
            className="p-1 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
            title="View Assignment Details"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
