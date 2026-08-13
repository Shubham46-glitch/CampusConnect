import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

const NotFoundPage = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/login';
    switch (user.role) {
      case 'faculty':
        return '/faculty/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100 shadow-sm">
        <AlertTriangle className="w-12 h-12" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full uppercase tracking-wider">
          404 Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
      </div>

      <Link to={getDashboardPath()}>
        <Button className="inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
