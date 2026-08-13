import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const ComplaintOverviewCard = ({
  pending = 0,
  inProgress = 0,
  resolved = 0,
  total = 0,
  linkPath = '/complaints',
}) => {
  const calculatedTotal = total || (pending + inProgress + resolved);

  // Calculate percentages for SVG Donut strokeDasharray
  const pendingPct = calculatedTotal > 0 ? (pending / calculatedTotal) * 100 : 0;
  const inProgressPct = calculatedTotal > 0 ? (inProgress / calculatedTotal) * 100 : 0;
  const resolvedPct = calculatedTotal > 0 ? (resolved / calculatedTotal) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Grievance Overview</span>
        </h3>
      </div>

      {/* Donut Chart & Legend Visualization */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-5 py-1">
        {/* SVG Donut Chart */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Track */}
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />

            {/* Resolved Segment */}
            {resolvedPct > 0 && (
              <path
                className="text-emerald-500"
                strokeWidth="4"
                strokeDasharray={`${resolvedPct}, 100`}
                strokeDashoffset="0"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            )}

            {/* In Progress Segment */}
            {inProgressPct > 0 && (
              <path
                className="text-amber-500"
                strokeWidth="4"
                strokeDasharray={`${inProgressPct}, 100`}
                strokeDashoffset={`-${resolvedPct}`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            )}

            {/* Pending Segment */}
            {pendingPct > 0 && (
              <path
                className="text-rose-500"
                strokeWidth="4"
                strokeDasharray={`${pendingPct}, 100`}
                strokeDashoffset={`-${resolvedPct + inProgressPct}`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            )}
          </svg>

          {/* Center Total Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-slate-900 leading-none">{calculatedTotal}</span>
            <span className="text-[9px] font-semibold uppercase text-slate-400 mt-0.5">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 text-xs w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">Pending</span>
            </div>
            <span className="font-semibold text-slate-900">{pending}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">In Progress</span>
            </div>
            <span className="font-semibold text-slate-900">{inProgress}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Resolved</span>
            </div>
            <span className="font-semibold text-slate-900">{resolved}</span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Grievance status tracking</span>
        <Link
          to={linkPath}
          className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View details →
        </Link>
      </div>
    </div>
  );
};

export default ComplaintOverviewCard;
