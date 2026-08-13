import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = "You're all caught up for now!",
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="py-10 px-4 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && actionLink && (
        <a
          href={actionLink}
          className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors pt-1"
        >
          {actionLabel} →
        </a>
      )}
    </div>
  );
};

export default EmptyState;
