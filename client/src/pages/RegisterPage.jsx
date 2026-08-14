import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Globe, Lock } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthBrandingPanel from '../components/AuthBrandingPanel';
import useAuth from '../hooks/useAuth';
import { DEPARTMENTS } from '../constants/departments';
import { getPublicClassesByDepartment } from '../services/academicService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: 'Computer Science',
    className: '',
    rollNumber: '',
    employeeId: '',
  });

  const [availableClasses, setAvailableClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const fetchClassesForDept = async (deptName) => {
    if (!deptName) return;
    try {
      setClassesLoading(true);
      const res = await getPublicClassesByDepartment(deptName);
      const list = res || [];
      setAvailableClasses(list);
    } catch (err) {
      console.error('Error fetching registration classes:', err);
    } finally {
      setClassesLoading(false);
    }
  };

  useEffect(() => {
    if (formData.role === 'student' && formData.department) {
      fetchClassesForDept(formData.department);
    }
  }, [formData.department, formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      // Auto-reset class selection when department changes (Requirement 13)
      setFormData({ ...formData, department: value, className: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    if (formData.role === 'student') {
      if (!formData.department) {
        setError('Please select your department.');
        return;
      }
      if (!formData.className) {
        setError('Please select your Class / Division.');
        return;
      }
      if (!formData.rollNumber.trim()) {
        setError('Please enter your Roll Number.');
        return;
      }
    } else if (formData.role === 'faculty') {
      if (!formData.department) {
        setError('Please select your department.');
        return;
      }
      if (!formData.employeeId.trim()) {
        setError('Please enter your Employee ID.');
        return;
      }
    } else if (formData.role === 'admin') {
      if (!formData.employeeId.trim()) {
        setError('Please enter your Employee / Admin ID.');
        return;
      }
    }

    const res = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.role === 'admin' ? '' : formData.department,
      className: formData.role === 'student' ? formData.className : '',
      rollNumber: formData.rollNumber,
      employeeId: formData.employeeId,
    });

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

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      <div className="w-full max-w-6xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch my-auto overflow-hidden">
        
        {/* Left Branding Panel matching role */}
        <AuthBrandingPanel role={formData.role} />

        {/* Right Column: Clean Form Layout */}
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
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-xs sm:text-sm text-slate-500">Fill in your details to create your CampusConnect account</p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={`grid grid-cols-1 ${formData.role === 'admin' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Account Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {formData.role !== 'admin' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formData.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Class / Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs font-medium"
                    >
                      <option value="" disabled>
                        {classesLoading ? 'Loading classes...' : 'Select Class ▼'}
                      </option>
                      {availableClasses.map((cls) => (
                        <option key={cls._id || cls.name} value={cls.name}>
                          {cls.name} ({cls.year || 'Second Year'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Roll Number"
                    name="rollNumber"
                    placeholder="e.g., CS202601"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {formData.role === 'faculty' && (
                <Input
                  label="Employee ID"
                  name="employeeId"
                  placeholder="e.g., EMP-8821"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              )}

              {formData.role === 'admin' && (
                <Input
                  label="Employee / Admin ID"
                  name="employeeId"
                  placeholder="e.g., ADM-1001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              )}

              <Button type="submit" fullWidth disabled={loading} size="lg" className="py-3 text-sm font-bold rounded-xl shadow-lg shadow-brand-600/25 mt-2">
                {loading ? 'Creating Account...' : 'Register Account'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2">
              Already registered?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          {/* Footer Rights & Links */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
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

export default RegisterPage;

