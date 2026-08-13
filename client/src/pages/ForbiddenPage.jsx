import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

const ForbiddenPage = () => {
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
      <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100 shadow-sm">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="px-3 py-1 bg-rose-100 text-rose-700 font-extrabold text-xs rounded-full uppercase tracking-wider">
          403 Access Denied
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Permission Restricted</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          You don't have permission to access this page. This resource is reserved for authorized portal roles.
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

export default ForbiddenPage;
