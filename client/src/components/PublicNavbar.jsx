import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight, LogIn, ChevronDown } from 'lucide-react';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    setLoginDropdownOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectRole = (role) => {
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileLoginOpen(false);
    navigate(`/login/${role}`);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 select-none transition-all">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Subtitle */}
        <Link to="/" className="flex items-center space-x-3 group focus:outline-none shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Campus<span className="text-brand-600">Connect</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block -mt-1">
              SMART CAMPUS PLATFORM
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="hover:text-brand-600 transition-colors focus:outline-none"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="hover:text-brand-600 transition-colors focus:outline-none"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('roles')}
            className="hover:text-brand-600 transition-colors focus:outline-none"
          >
            Roles
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-brand-600 transition-colors focus:outline-none whitespace-nowrap"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="hover:text-brand-600 transition-colors focus:outline-none"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="hover:text-brand-600 transition-colors focus:outline-none"
          >
            Contact
          </button>
        </nav>

        {/* Right: Desktop Action CTAs */}
        <div className="hidden lg:flex items-center space-x-3 shrink-0">
          {/* Compact Login Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLoginDropdownOpen((prev) => !prev)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all focus:outline-none"
              aria-expanded={loginDropdownOpen}
              aria-haspopup="true"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Login</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {loginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                >
                  <span className="text-base leading-none">🎓</span>
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('faculty')}
                  className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                >
                  <span className="text-base leading-none">👨‍🏫</span>
                  <span>Faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                >
                  <span className="text-base leading-none">🛡</span>
                  <span>Admin</span>
                </button>
              </div>
            )}
          </div>

          <Link
            to="/register"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-3 bg-white">
          <nav className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('roles')}
              className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors"
            >
              Roles
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors"
            >
              Contact
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2 px-2">
            {/* Mobile Login Dropdown Expandable */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setMobileLoginOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Login</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${mobileLoginOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileLoginOpen && (
                <div className="pl-4 space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectRole('student')}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                  >
                    <span className="text-base leading-none">🎓</span>
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('faculty')}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                  >
                    <span className="text-base leading-none">👨‍🏫</span>
                    <span>Faculty</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('admin')}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                  >
                    <span className="text-base leading-none">🛡</span>
                    <span>Admin</span>
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
