import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Award, ArrowRight } from 'lucide-react';

const AssignmentCard = ({ assignment }) => {
  if (!assignment) return null;

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  
  let dueText = `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  if (diffDays === 0) dueText = 'Due Today';
  if (diffDays < 0) dueText = 'Past Due';

  const isPastDue = diffDays < 0;
  const isDueSoon = diffDays >= 0 && diffDays <= 2;

  // Mock progress percentage based on submission state or arbitrary 70%
  const progress = isPastDue ? 100 : isDueSoon ? 85 : 45;

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-black rounded-full uppercase tracking-wider">
            {assignment.subject || 'Coursework'}
          </span>
          <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
            {assignment.title}
          </h4>
        </div>

        {isDueSoon ? (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black rounded-md shrink-0 animate-pulse">
            {dueText}
          </span>
        ) : isPastDue ? (
          <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black rounded-md shrink-0">
            {dueText}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-md shrink-0">
            {dueText}
          </span>
        )}
      </div>

      {/* Progress Bar & Marks */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500 flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{assignment.totalMarks} Marks</span>
          </span>
          <span className="text-brand-600 font-extrabold">{progress}% Ready</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPastDue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-500' : 'bg-brand-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
        <span className="text-[10px] font-medium text-slate-400">
          Due: {dueDate.toLocaleDateString()}
        </span>
        <Link
          to={`/assignments/${assignment._id}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <span>Submit Work</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default AssignmentCard;
