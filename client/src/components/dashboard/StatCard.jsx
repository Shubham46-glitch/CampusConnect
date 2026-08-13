import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  badgeText,
  variant = 'blue',
  subtitle,
  progress,
}) => {
  const themes = {
    blue: {
      cardBg: 'bg-gradient-to-br from-white via-white to-blue-50/50',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
      border: 'border-blue-100/80 hover:border-blue-300',
      accentColor: 'bg-blue-600',
    },
    emerald: {
      cardBg: 'bg-gradient-to-br from-white via-white to-emerald-50/50',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      border: 'border-emerald-100/80 hover:border-emerald-300',
      accentColor: 'bg-emerald-600',
    },
    purple: {
      cardBg: 'bg-gradient-to-br from-white via-white to-purple-50/50',
      iconBg: 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-md shadow-purple-500/20',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
      border: 'border-purple-100/80 hover:border-purple-300',
      accentColor: 'bg-purple-600',
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-white via-white to-amber-50/50',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
      border: 'border-amber-100/80 hover:border-amber-300',
      accentColor: 'bg-amber-500',
    },
  };

  const theme = themes[variant] || themes.blue;

  return (
    <div
      className={`rounded-3xl border ${theme.border} ${theme.cardBg} p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 space-y-4 group relative overflow-hidden`}
    >
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accentColor} opacity-80`} />

      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {badgeText && (
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${theme.badgeBg}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          {title}
        </h4>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {value !== undefined ? (value < 10 ? `0${value}` : value) : '00'}
        </div>
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 pt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {progress !== undefined && (
        <div className="space-y-1 pt-1">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${theme.accentColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
