import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Command,
  X,
  Calendar,
  Megaphone,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService';
import { performGlobalSearch } from '../services/searchService';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Notifications state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Global Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch Notification Count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread notification count', err);
    }
  };

  const fetchNotificationsList = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingNotifs(true);
      const data = await getNotifications();
      setNotifications(data);
      const count = data.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications list', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Debounced Global Search Handler
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      setSearchDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchDropdownOpen(true);

    const timer = setTimeout(async () => {
      try {
        const data = await performGlobalSearch(searchTerm);
        setSearchResults(data.results || null);
      } catch (err) {
        console.error('Error performing global search:', err);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    setSearchDropdownOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSelectResult = (path) => {
    setSearchDropdownOpen(false);
    setSearchTerm('');
    navigate(path);
  };

  const handleToggleNotifDropdown = () => {
    if (!dropdownOpen) {
      fetchNotificationsList();
    }
    setDropdownOpen((prev) => !prev);
    setProfileDropdownOpen(false);
    setSearchDropdownOpen(false);
  };

  const handleToggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => !prev);
    setDropdownOpen(false);
    setSearchDropdownOpen(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSearchDropdownOpen(false);
        setDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const hasResults =
    searchResults &&
    (searchResults.events?.length > 0 ||
      searchResults.announcements?.length > 0 ||
      searchResults.assignments?.length > 0 ||
      searchResults.complaints?.length > 0 ||
      searchResults.users?.length > 0);

  return (
    <header className="bg-white border-b border-slate-200/80 h-16 sticky top-0 z-40 px-6 flex items-center justify-between select-none">
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Container */}
        <div className="relative w-64 sm:w-80 md:w-96" ref={searchContainerRef}>
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.trim().length >= 2 && setSearchDropdownOpen(true)}
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder:text-slate-400 transition-all"
          />

          <div className="absolute right-2.5 top-2 flex items-center space-x-1">
            {searchTerm ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-400">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            )}
          </div>

          {/* Search Dropdown Results Panel */}
          {searchDropdownOpen && (
            <div className="absolute left-0 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden text-xs max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="py-6 text-center text-slate-500 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  <span>Searching CampusConnect...</span>
                </div>
              ) : hasResults ? (
                <div className="divide-y divide-slate-100 py-1">
                  {/* Events */}
                  {searchResults.events?.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>Events</span>
                      </div>
                      {searchResults.events.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectResult(`/events`)}
                          className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.venue}</p>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium shrink-0">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Announcements */}
                  {searchResults.announcements?.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <Megaphone className="w-3 h-3 text-brand-600" />
                        <span>Announcements</span>
                      </div>
                      {searchResults.announcements.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectResult(`/announcements`)}
                          className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assignments */}
                  {searchResults.assignments?.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <BookOpen className="w-3 h-3 text-amber-600" />
                        <span>Assignments</span>
                      </div>
                      {searchResults.assignments.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectResult(`/assignments/${item._id}`)}
                          className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.subject}</p>
                          </div>
                          <span className="text-[10px] text-amber-600 font-medium shrink-0">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Complaints */}
                  {searchResults.complaints?.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Grievances</span>
                      </div>
                      {searchResults.complaints.map((item) => (
                        <div
                          key={item._id}
                          onClick={() =>
                            handleSelectResult(
                              user?.role === 'admin' ? '/admin/complaints' : '/complaints'
                            )
                          }
                          className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 capitalize">{item.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Users (Admin / Faculty only) */}
                  {searchResults.users?.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <UserIcon className="w-3 h-3 text-indigo-600" />
                        <span>Users & Profiles</span>
                      </div>
                      {searchResults.users.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectResult(`/profile`)}
                          className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.email}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-indigo-600 capitalize shrink-0">
                            {item.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-xs">No results found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile Trigger */}
      <div className="flex items-center space-x-3">
        {isAuthenticated && (
          <>
            {/* Notification Trigger */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={handleToggleNotifDropdown}
                className={`p-2 rounded-lg transition-colors relative flex items-center justify-center ${
                  dropdownOpen
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {dropdownOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  loading={loadingNotifs}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Profile Dropdown Trigger */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={handleToggleProfileDropdown}
                className="flex items-center space-x-2.5 py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center uppercase shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center space-x-1">
                    <span>{user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {user?.role}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden py-1">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Profile</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
