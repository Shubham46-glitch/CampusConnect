import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

const roleConfig = {
  student: {
    label: 'Student',
    title: 'Student Login',
    buttonText: 'Login as Student',
    description: 'Access coursework, assignments, event registration, & announcements',
    placeholder: 'student@college.edu',
    icon: GraduationCap,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200 hover:border-sky-400 hover:bg-sky-100/60',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  faculty: {
    label: 'Faculty',
    title: 'Faculty Login',
    buttonText: 'Login as Faculty',
    description: 'Manage assignments, review submissions, grade students, & post notices',
    placeholder: 'faculty@college.edu',
    icon: Users,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100/60',
    badgeColor: 'bg-indigo-100 text-indigo-800',
  },
  admin: {
    label: 'Admin',
    title: 'Admin Login',
    buttonText: 'Login as Admin',
    description: 'Full oversight, user administration, analytics, & complaint resolution',
    placeholder: 'admin@college.edu',
    icon: ShieldCheck,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
};

const LoginPage = () => {
  const { role } = useParams();
  const normalizedRole = role ? role.toLowerCase() : null;
  const currentRoleConfig = roleConfig[normalizedRole];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      const redirectMap = {
        student: '/student/dashboard',
        faculty: '/faculty/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(redirectMap[res.role] || '/student/dashboard');
    } else {
      setError(res.message);
    }
  };

  // If no valid role parameter is present in URL (/login), show Role Selection interface
  if (!currentRoleConfig) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Login to CampusConnect</h2>
            <p className="text-xs text-slate-500">Select your role to access your dedicated login portal</p>
          </div>

          <div className="space-y-3.5">
            {Object.entries(roleConfig).map(([key, config]) => {
              const RoleIcon = config.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`/login/${key}`)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${config.bgColor} ${config.textColor} ${config.borderColor}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                      <RoleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-base">{config.label}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${config.badgeColor}`}>
                          {key}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{config.buttonText}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{config.description}</p>
                    </div>
                  </div>

                  <div className="p-2 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-600 font-bold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className={`inline-flex p-3.5 ${currentRoleConfig.bgColor} rounded-2xl ${currentRoleConfig.textColor} mb-1 shadow-sm`}>
            <RoleIcon className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900">{currentRoleConfig.title}</h2>
          </div>
          <p className="text-xs text-slate-500">Sign in to your CampusConnect {currentRoleConfig.label} account</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder={currentRoleConfig.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Authenticating...' : `Sign In as ${currentRoleConfig.label}`}
          </Button>
        </form>

        <div className="space-y-3 pt-2 border-t border-slate-100 text-center text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>Selected Role: <strong className="text-slate-800 capitalize">{currentRoleConfig.label}</strong></span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-semibold focus:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Role</span>
            </button>
          </div>

          <div className="text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-600 font-bold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
