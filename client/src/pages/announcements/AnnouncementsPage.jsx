import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Plus, Search, Filter } from 'lucide-react';
import AnnouncementCard from '../../components/announcements/AnnouncementCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { getAnnouncements } from '../../services/announcementService';
import useAuth from '../../hooks/useAuth';

const CATEGORIES = ['all', 'academic', 'event', 'examination', 'placement', 'general', 'urgent'];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
      setError('');
    } catch (err) {
      setError('Failed to load campus announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const canCreate = user?.role === 'faculty' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Megaphone className="w-7 h-7 text-brand-600" />
            <span>Campus Noticeboard</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Official department notices, examination schedules, and institutional announcements.
          </p>
        </div>

        {canCreate && (
          <Link to="/announcements/create">
            <Button className="shadow-md shadow-brand-500/20">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Publish Notice</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-40 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full md:w-36 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Priorities' : `${p} priority`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading campus noticeboard..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
          {error}
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((item) => (
            <AnnouncementCard key={item._id} announcement={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Announcements Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no active notices matching your current search or filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
