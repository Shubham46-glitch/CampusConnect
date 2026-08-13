import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Tag, ChevronRight } from 'lucide-react';
import EventStatusBadge from './EventStatusBadge';
import RegistrationButton from './RegistrationButton';
import useAuth from '../../hooks/useAuth';

const EventCard = ({ event, onRegister, onCancel }) => {
  const { user } = useAuth();

  const participantCount = event.participants?.length || 0;
  const availableSeats = Math.max(0, event.capacity - participantCount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Header Info */}
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
            {event.category}
          </span>
          <EventStatusBadge status={event.status} />
        </div>

        <Link to={`/events/${event._id}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
            {event.title}
          </h3>
        </Link>

        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Date, Time, Venue Info */}
        <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Users className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-700">{availableSeats}</span> seats left
        </div>

        <div className="flex items-center space-x-2">
          {user?.role === 'student' && (
            <RegistrationButton
              event={event}
              currentUserId={user?._id}
              userRole={user?.role}
              onRegister={onRegister}
              onCancel={onCancel}
            />
          )}

          {(user?.role === 'admin' || (user?.role === 'faculty' && event.createdBy?._id === user?._id)) && (
            <Link
              to={`/events/${event._id}`}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 text-brand-700 hover:text-brand-800 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Registrations ({participantCount})
            </Link>
          )}

          <Link
            to={`/events/${event._id}`}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
            title="View Event Details"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
