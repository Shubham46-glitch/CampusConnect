import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight, LogIn, ChevronDown } from 'lucide-react';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [activeSection, setActiveSection] = useState('home');

  const dropdownRef = useRef(null);
  const lastScrollY = useRef(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll direction detection for navbar resizing
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section highlighting
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = ['home', 'features', 'roles', 'how-it-works', 'about', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [location.pathname]);

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
    setActiveSection(sectionId);

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

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'roles', label: 'Roles' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const isScrolledDown = scrollDirection === 'down';

  return (
    <header
      className={`sticky top-0 z-50 px-4 sm:px-6 lg:px-8 select-none transition-all duration-300 ease-in-out ${
        isScrolledDown
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md py-1'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-0'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolledDown ? 'h-20' : 'h-14'
        }`}
      >
        {/* Left: Brand Logo & Subtitle */}
        <Link to="/" className="flex items-center space-x-3 group focus:outline-none shrink-0">
          <div
            className={`rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all duration-300 ${
              isScrolledDown ? 'w-10 h-10' : 'w-8 h-8'
            }`}
          >
            <GraduationCap className={`transition-all duration-300 ${isScrolledDown ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`font-extrabold text-slate-900 tracking-tight transition-all duration-300 ${
                  isScrolledDown ? 'text-xl' : 'text-base'
                }`}
              >
                Campus<span className="text-brand-600">Connect</span>
              </span>
            </div>
            <span
              className={`font-semibold tracking-wider text-slate-500 uppercase block -mt-1 transition-all duration-300 ${
                isScrolledDown ? 'text-[10px]' : 'text-[9px]'
              }`}
            >
              SMART CAMPUS PLATFORM
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Equal Spacing & Vertically Centered) */}
        <nav
          className={`hidden lg:flex items-center text-sm font-medium text-slate-600 transition-all duration-300 ${
            isScrolledDown ? 'space-x-7' : 'space-x-5'
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'text-brand-600 bg-brand-50/90 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Desktop Action CTAs with Premium Micro-Interactions */}
        <div className="hidden lg:flex items-center space-x-3 shrink-0">
          {/* Compact Login Role Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLoginDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center space-x-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 ease-out focus:outline-none hover:-translate-y-0.5 active:translate-y-0 active:scale-98 ${
                isScrolledDown ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs'
              }`}
              aria-expanded={loginDropdownOpen}
              aria-haspopup="true"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Login</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  loginDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {loginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn">
                <div className="px-3.5 py-1 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Your Role
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                >
                  <span className="text-base leading-none">🎓</span>
                  <span>Student Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('faculty')}
                  className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                >
                  <span className="text-base leading-none">👨‍🏫</span>
                  <span>Faculty Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className="w-full px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                >
                  <span className="text-base leading-none">🛡</span>
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>

          <Link
            to="/register"
            className={`inline-flex items-center space-x-1.5 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg hover:shadow-brand-600/25 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.015] active:translate-y-0 active:scale-98 group ${
              isScrolledDown ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs'
            }`}
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-brand-600 bg-brand-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
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
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    mobileLoginOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileLoginOpen && (
                <div className="pl-4 space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectRole('student')}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                  >
                    <span className="text-base leading-none">🎓</span>
                    <span>Student Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('faculty')}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                  >
                    <span className="text-base leading-none">👨‍🏫</span>
                    <span>Faculty Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRole('admin')}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center space-x-2.5 transition-colors"
                  >
                    <span className="text-base leading-none">🛡</span>
                    <span>Admin Login</span>
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all duration-200 active:scale-95 shadow-sm"
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

