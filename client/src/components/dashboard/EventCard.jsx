import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const EventCard = ({ event }) => {
  if (!event) return null;

  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate().toString().padStart(2, '0');

  return (
    <Link
      to={`/events/${event._id}`}
      className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 group"
    >
      <div className="flex items-center space-x-4">
        {/* Date Block */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-brand-600 to-indigo-700 text-white flex flex-col items-center justify-center shrink-0 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <span className="text-[10px] font-black tracking-widest uppercase text-brand-200">
            {month}
          </span>
          <span className="text-lg font-black leading-none">
            {day}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1 overflow-hidden">
          <h4 className="text-xs font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
            {event.title}
          </h4>

          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
            {event.time && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{event.time}</span>
              </span>
            )}
            {event.venue && (
              <span className="flex items-center space-x-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{event.venue}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Arrow Action */}
      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-50 text-slate-400 group-hover:text-brand-600 flex items-center justify-center shrink-0 transition-colors">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
};

export default EventCard;
