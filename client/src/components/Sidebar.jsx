import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  BookOpen,
  AlertCircle,
  BarChart3,
  TrendingUp,
  GraduationCap,
  Building2,
  UserCheck,
  History,
  CheckSquare,
  Layers,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';


const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'student';

  const menuConfig = {
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Attendance', path: '/student/attendance', icon: CheckSquare },
      { name: 'Assignments', path: '/assignments', icon: BookOpen },
      { name: 'My Submissions', path: '/student/submissions', icon: FileText },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Announcements', path: '/announcements', icon: Megaphone },
      { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    ],
    faculty: [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'My Students', path: '/faculty/performance', icon: TrendingUp },
      { name: 'My Subjects', path: '/faculty/subjects', icon: BookOpen },
      { name: 'Attendance', path: '/faculty/attendance-history', icon: CheckSquare },
      { name: 'Assignments', path: '/assignments', icon: BookOpen },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Announcements', path: '/announcements', icon: Megaphone },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Departments', path: '/admin/departments', icon: Building2 },
      { name: 'Academic Classes', path: '/admin/classes', icon: Layers },
      { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
      { name: 'Faculty Roster', path: '/admin/faculty-assignments', icon: UserCheck },
      { name: 'Student Roster', path: '/admin/enrollments', icon: GraduationCap },
      { name: 'Attendance Analytics', path: '/admin/attendance-analytics', icon: CheckSquare },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Announcements', path: '/announcements', icon: Megaphone },
      { name: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
      { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Activity Logs', path: '/admin/logs', icon: History },
    ],
  };

  const links = menuConfig[role] || menuConfig.student;

  const isLinkActive = (itemPath) => {
    const currentPath = location.pathname;
    if (itemPath === currentPath) return true;
    if (itemPath.includes('/faculty/performance')) {
      return currentPath.includes('/faculty/performance') || currentPath.includes('/faculty/students');
    }
    if (itemPath.includes('/faculty/subjects')) return currentPath.includes('/faculty/subjects') || currentPath.includes('/faculty/take-attendance');
    if (itemPath.includes('/faculty/attendance-history')) return currentPath.includes('/faculty/attendance-history');
    if (itemPath.includes('/student/attendance')) return currentPath.includes('/student/attendance');
    if (itemPath.includes('/admin/classes')) return currentPath.includes('/admin/classes');
    if (itemPath.includes('/admin/subjects')) return currentPath.includes('/admin/subjects');
    if (itemPath.includes('/admin/faculty-assignments')) return currentPath.includes('/admin/faculty-assignments');
    if (itemPath.includes('/admin/enrollments')) return currentPath.includes('/admin/enrollments');
    if (itemPath.includes('/admin/attendance-analytics')) return currentPath.includes('/admin/attendance-analytics');
    if (itemPath.includes('/admin/departments')) return currentPath.includes('/admin/departments');
    if (itemPath.includes('/admin/logs')) return currentPath.includes('/admin/logs');
    if (itemPath.includes('analytics')) return currentPath.includes('/analytics');
    if (itemPath.includes('dashboard')) return currentPath.includes('/dashboard');
    if (itemPath.startsWith('/events')) return currentPath.startsWith('/events');
    if (itemPath.startsWith('/announcements')) return currentPath.startsWith('/announcements');
    if (itemPath.startsWith('/assignments')) return currentPath.startsWith('/assignments');
    if (itemPath.includes('complaints')) return currentPath.includes('complaints');
    return false;
  };


  return (
    <aside className="w-64 bg-white text-slate-700 h-screen flex flex-col border-r border-slate-200/80 shrink-0 z-30 select-none">
      {/* Top Header Logo */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center space-x-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-2xs shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight truncate">
            Campus<span className="text-brand-600">Connect</span>
          </span>
          <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">
            SMART PLATFORM
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.path);

          return (
            <NavLink
              key={item.name + item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                active
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Status Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 truncate">{user?.name}</h4>
            <p className="text-[10px] text-slate-500 capitalize truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
