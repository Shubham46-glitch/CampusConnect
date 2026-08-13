import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getEvents, registerForEvent, cancelRegistration } from '../../services/eventService';
import { EVENT_CATEGORIES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(eventId);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await cancelRegistration(eventId);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canCreate = user?.role === 'faculty' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-brand-600" />
            <span>Campus Events</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Discover workshops, seminars, cultural fests, and academic conferences.
          </p>
        </div>

        {canCreate && (
          <Link to="/events/create">
            <Button className="shadow-md shadow-brand-500/20">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Event</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search events or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
          >
            <option value="all">All Categories</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading campus events..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
          {error}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRegister={handleRegister}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Events Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No events match your current filter or search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
