import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  ArrowLeft,
  Edit,
  Trash2,
  ListFilter,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import EventStatusBadge from '../../components/events/EventStatusBadge';
import RegistrationButton from '../../components/events/RegistrationButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import {
  getEventById,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
} from '../../services/eventService';
import useAuth from '../../hooks/useAuth';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Registrations state
  const [registrations, setRegistrations] = useState(null);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regError, setRegError] = useState('');
  const [showRegistrations, setShowRegistrations] = useState(false);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await getEventById(id);
      setEvent(data);
      setError('');
    } catch (err) {
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoadingRegs(true);
      setRegError('');
      const data = await getEventRegistrations(id);
      setRegistrations(data);
      setShowRegistrations(true);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to fetch registered students.');
    } finally {
      setLoadingRegs(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const handleRegister = async () => {
    try {
      await registerForEvent(id);
      fetchEventDetails();
      if (showRegistrations) fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRegistration(id);
      fetchEventDetails();
      if (showRegistrations) fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setDeleteLoading(true);
        await deleteEvent(id);
        navigate('/events');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete event');
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl inline-block text-xs font-semibold">
          {error || 'Event not found'}
        </div>
        <div>
          <Link to="/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = event.createdBy?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canModify = isCreator || isAdmin;

  const participantCount = event.participants?.length || 0;
  const availableSeats = Math.max(0, event.capacity - participantCount);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link to="/events" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to All Events</span>
        </Link>

        {canModify && (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (showRegistrations) {
                  setShowRegistrations(false);
                } else {
                  fetchRegistrations();
                }
              }}
              disabled={loadingRegs}
            >
              <ListFilter className="w-3.5 h-3.5 mr-1" />
              {showRegistrations ? 'Hide Registrations' : 'View Registrations'}
            </Button>

            <Link to={`/events/${event._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" size="sm" disabled={deleteLoading} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Event Card Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
                {event.category}
              </span>
              <EventStatusBadge status={event.status} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{event.title}</h1>
          </div>

          {user?.role === 'student' && (
            <RegistrationButton
              event={event}
              currentUserId={user?._id}
              userRole={user?.role}
              onRegister={handleRegister}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Date</span>
            <p className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
              {new Date(event.date).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Time</span>
            <p className="font-bold text-slate-800 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              {event.time}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Venue</span>
            <p className="font-bold text-slate-800 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              {event.venue}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Seats Available</span>
            <p className="font-bold text-slate-800 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              {availableSeats} / {event.capacity}
            </p>
          </div>
        </div>

        {/* Event Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">About This Event</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>

        {/* Organizer Details */}
        <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center uppercase text-sm">
            {event.createdBy?.name?.charAt(0) || 'F'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{event.createdBy?.name || 'Faculty Organizer'}</h4>
            <p className="text-[11px] text-slate-500">
              Organizer • Dept. of {event.createdBy?.department || 'Academic'}
            </p>
          </div>
        </div>
      </div>

      {/* Registered Students Section (Visible ONLY to Creator Faculty & Admin) */}
      {canModify && showRegistrations && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>Registered Students ({registrations?.count || participantCount})</span>
            </h3>
            <Badge variant="primary">
              {availableSeats} seats remaining
            </Badge>
          </div>

          {loadingRegs ? (
            <LoadingSpinner size="sm" text="Fetching student registrations..." />
          ) : regError ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{regError}</span>
            </div>
          ) : (
            <Table headers={['Student Name', 'Email', 'Roll Number', 'Department', 'Registration Date']}>
              {registrations?.participants?.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{student.name}</td>
                  <td className="px-4 py-3 text-slate-600">{student.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {student.profileInfo?.rollNumber || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{student.department || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
