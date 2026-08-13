import React from 'react';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  color = 'brand',
  subtitle,
  indicator,
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-600',
      indicator: 'text-emerald-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      indicator: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      indicator: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      indicator: 'text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      indicator: 'text-rose-600',
    },
  };

  const currentTheme = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
      {/* Icon & Label Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center shrink-0`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>

      {/* Metric Value */}
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none">
          {value !== undefined ? value : 0}
        </div>
      </div>

      {/* Subtext Indicator */}
      {(subtitle || indicator) && (
        <div className="text-xs text-slate-500 flex items-center space-x-1 pt-0.5">
          <span className="truncate">{indicator || subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
