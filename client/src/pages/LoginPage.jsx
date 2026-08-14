import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, Lock, Globe } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthBrandingPanel from '../components/AuthBrandingPanel';
import useAuth from '../hooks/useAuth';

const roleConfig = {
  student: {
    label: 'Student',
    title: 'Student Login',
    placeholder: 'student@college.edu',
    icon: GraduationCap,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
  faculty: {
    label: 'Faculty',
    title: 'Faculty Login',
    placeholder: 'faculty@college.edu',
    icon: Users,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  admin: {
    label: 'Admin',
    title: 'Admin Login',
    placeholder: 'admin@college.edu',
    icon: ShieldCheck,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
};

const LoginPage = () => {
  const { role } = useParams();
  const normalizedRole = role ? role.toLowerCase() : null;
  const currentRoleConfig = roleConfig[normalizedRole];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const { login, logout, loading } = useAuth();
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
      // If a role-specific login route was used (/login/student), enforce matching role
      if (normalizedRole && res.role !== normalizedRole) {
        logout();
        setError(`Access denied: This login portal is strictly for ${currentRoleConfig?.label || normalizedRole} accounts. Your account role is "${res.role}".`);
        return;
      }

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

  const formTitle = currentRoleConfig ? currentRoleConfig.title : 'Login';
  const formSubtitle = currentRoleConfig
    ? `Enter your credentials to login as ${currentRoleConfig.label}`
    : 'Enter your credentials to login to your account';
  const emailPlaceholder = currentRoleConfig ? currentRoleConfig.placeholder : 'example.student@college.edu';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      <div className="w-full max-w-6xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch my-auto overflow-hidden">
        
        {/* Left Column: Branding Panel matching design template */}
        <AuthBrandingPanel role={normalizedRole || 'student'} />

        {/* Right Column: Clean Modern Form Layout */}
        <div className="w-full lg:col-span-7 flex flex-col justify-between p-2 sm:p-6 lg:p-8">
          
          {/* Header Brand Icon & Titles */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Campus<span className="text-brand-600">Connect</span>
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{formTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-500">{formSubtitle}</p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <Input
                label="Email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Remember Me Options */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-colors"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-slate-400 cursor-not-allowed hover:text-slate-600">
                  Forgot Password?
                </span>
              </div>

              {/* Submit Button */}
              <Button type="submit" fullWidth disabled={loading} size="lg" className="py-3 text-sm font-bold rounded-xl shadow-lg shadow-brand-600/25">
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-3">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Footer Rights & Links */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-6">
            <span>© 2026 All rights reserved CampusConnect</span>
            <div className="flex items-center space-x-3 text-slate-400">
              <Globe className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
              <Lock className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;



