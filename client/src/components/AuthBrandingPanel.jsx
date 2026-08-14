import React from 'react';
import { GraduationCap, Users, ShieldCheck, CheckCircle2, Sparkles, BookOpen, Award } from 'lucide-react';

const roleMeta = {
  student: {
    title: 'Student Portal',
    badge: 'STUDENT WORKSPACE',
    subtitle: 'Access coursework, submit assignments, register for events & view announcements.',
    icon: GraduationCap,
    gradient: 'from-blue-600 via-indigo-600 to-slate-900',
    accentColor: 'text-sky-300',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    perks: ['Track coursework & due dates', 'Instant grade notifications', 'One-click event registration'],
  },
  faculty: {
    title: 'Faculty Portal',
    badge: 'FACULTY WORKSPACE',
    subtitle: 'Manage assignments, review submissions, grade students & publish notices.',
    icon: Users,
    gradient: 'from-indigo-600 via-brand-600 to-slate-900',
    accentColor: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    perks: ['Streamlined assignment grading', 'Publish official campus notices', 'Review student submissions'],
  },
  admin: {
    title: 'Admin Control Center',
    badge: 'ADMIN WORKSPACE',
    subtitle: 'Full oversight, user management, platform analytics & complaint resolution.',
    icon: ShieldCheck,
    gradient: 'from-slate-900 via-indigo-950 to-brand-900',
    accentColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    perks: ['Manage students & faculty accounts', 'Platform activity analytics', 'Grievance resolution management'],
  },
};

const AuthBrandingPanel = ({ role = 'student' }) => {
  const currentRole = roleMeta[role] || roleMeta.student;
  const RoleIcon = currentRole.icon;

  return (
    <div className={`hidden lg:flex lg:col-span-5 flex-col justify-between bg-gradient-to-br ${currentRole.gradient} rounded-3xl p-8 xl:p-10 text-white shadow-2xl relative overflow-hidden min-h-[540px] border border-white/10 select-none`}>
      
      {/* Curved Graphic Wave Overlay (Inspired by design template) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 600"
        fill="none"
      >
        <circle cx="200" cy="300" r="180" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="200" cy="300" r="260" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="340" stroke="white" strokeWidth="1.5" />
        <path d="M-50 150 Q 200 50 450 150" stroke="white" strokeWidth="2" opacity="0.6" />
        <path d="M-50 450 Q 200 550 450 450" stroke="white" strokeWidth="2" opacity="0.6" />
      </svg>

      {/* Top Section: Brand Header */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Campus<span className="text-brand-300">Connect</span>
              </span>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase block -mt-1">
              SMART CAMPUS PLATFORM
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${currentRole.badgeBg}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentRole.badge}</span>
          </div>

          <h2 className="text-2xl xl:text-3xl font-extrabold leading-tight tracking-tight text-white">
            {currentRole.title}
          </h2>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-sm">
            {currentRole.subtitle}
          </p>
        </div>
      </div>

      {/* Center Hero Card Visual (Illustration Placeholder Element) */}
      <div className="relative z-10 my-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl relative space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-brand-600 flex items-center justify-center shadow-lg shrink-0">
              <RoleIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">CampusConnect Hub</p>
              <p className="text-sm font-extrabold text-slate-100 mt-0.5">{currentRole.title}</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Role-based authenticated access</p>
            </div>
          </div>

          {/* Perks list */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            {currentRole.perks.map((perk, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
        <span>© 2026 CampusConnect</span>
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-300" />
          <span className="text-[11px] font-medium text-slate-200">Higher Education SaaS</span>
        </div>
      </div>
    </div>
  );
};

export default AuthBrandingPanel;
