import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Calendar,
  Megaphone,
  AlertCircle,
  Bell,
  Lock,
  UserCheck,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Button from '../components/Button';
import Hero3DCanvas from '../components/landing/Hero3DCanvas';

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="space-y-16 sm:space-y-20 py-8 select-none">
      
      {/* 1. HERO SECTION WITH 3D CANVAS BACKGROUND */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-8 md:pt-12 overflow-hidden rounded-3xl" id="home">
        <Hero3DCanvas />
        <div className="relative z-10 space-y-8">
          {/* Product Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-50/90 backdrop-blur-md border border-brand-200 text-brand-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            <span>SMART CAMPUS MANAGEMENT PLATFORM</span>
          </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight md:leading-tight">
          Smart College Management &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            Collaboration Platform
          </span>
        </h1>

        {/* Product Description */}
        <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          CampusConnect connects Students, Faculty, and Administrators through a unified platform for academic workflows, events, assignments, announcements, complaints, and campus communication.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-brand-500/25 px-8 py-3 text-sm">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 text-sm border-slate-300 text-slate-700 hover:bg-slate-100">
              Login to Portal
            </Button>
          </Link>
        </div>
      </div>
    </section>

      {/* 2. WHAT IS CAMPUSCONNECT? (ABOUT SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="about">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>About CampusConnect</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              One Digital Hub for Your Entire Campus
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Managing coursework, event registrations, campus notices, and grievances often involves fragmented systems. CampusConnect integrates these essential tools into a streamlined, role-based platform designed specifically for modern higher education institutions.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TAILORED EXPERIENCE FOR EVERY ROLE (ROLES SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="roles">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tailored Experience for Every Role
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Dedicated portals built with secure role-based access control (RBAC)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student Role Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">STUDENT PORTAL</h3>
                <p className="text-xs text-slate-500 mt-1">Empowering students with seamless academic access and tracking.</p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>View assignments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Submit coursework</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Register for events</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>View announcements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Raise complaints</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Receive notifications</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Faculty Role Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">FACULTY PORTAL</h3>
                <p className="text-xs text-slate-500 mt-1">Simplifying course management and student evaluations.</p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Manage assignments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Review submissions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Grade students</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Manage events</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Publish announcements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Handle academic activities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Admin Role Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">ADMIN CONTROL CENTER</h3>
                <p className="text-xs text-slate-500 mt-1">Full oversight, platform analytics, and user administration.</p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Manage students and faculty</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Monitor platform activity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Manage announcements/events</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Monitor complaints</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>View analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Manage users</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="features">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Core Features
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Comprehensive tools built specifically to streamline campus management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Assignment Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create, assign, submit, and grade coursework with deadline tracking and status indicators.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Event Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Publish campus workshops, academic seminars, and enable single-click student registration.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Announcements</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Broadcast urgent campus notices and official department updates to targeted audiences.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Complaint Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log grievances, assign resolution staff, and monitor status updates until resolution.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Notifications</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive real-time alerts for grade updates, new notices, and complaint status changes.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Role-Based Access Control</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforce strict data privacy and user permissions across Student, Faculty, and Admin roles.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">User Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Administrators can manage active accounts, update roles, and audit user permissions.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Admin Analytics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-level overview metrics for campus activity, complaint metrics, and user growth.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW CAMPUSCONNECT WORKS (HOW IT WORKS SECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="how-it-works">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CampusConnect Works
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            A simple 3-step workflow designed for rapid adoption and efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Register / Sign In</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log in with secure authentication. You are instantly routed to your customized Student, Faculty, or Admin dashboard.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Access Role-Based Portal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Faculty publish assignments and events. Students submit coursework and register for events with one click.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-extrabold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Manage Academic Activities</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get instant notifications for grades and announcements. Administrators monitor complaints and track campus analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER (CONTACT / FOOTER ANCHOR) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4" id="contact">
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Ready to Modernize Your Campus Workflows?
          </h2>
          <p className="text-brand-100 text-sm sm:text-base max-w-xl mx-auto">
            Join CampusConnect today to streamline assignments, events, announcements, and campus communication.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm text-brand-700 bg-white hover:bg-slate-100 transition-all shadow-lg active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/30 transition-all active:scale-95"
            >
              <span>Login to Portal</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
