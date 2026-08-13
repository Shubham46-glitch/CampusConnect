import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Building2, Hash, CreditCard, Edit3, CheckCircle2, Lock, Save, X, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  // Fetch complete profile from backend on mount
  const fetchFullProfile = async () => {
    try {
      setFetchingDetails(true);
      const res = await API.get('/auth/profile');
      const data = res.data;
      setName(data.name || '');
      setDepartment(data.department || '');
      setRollNumber(data.profileInfo?.rollNumber || '');
      setEmployeeId(data.profileInfo?.employeeId || '');
    } catch (err) {
      console.error('Error fetching profile details', err);
      if (user) {
        setName(user.name || '');
        setDepartment(user.department || '');
        setRollNumber(user.profileInfo?.rollNumber || '');
        setEmployeeId(user.profileInfo?.employeeId || '');
      }
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchFullProfile();
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full Name is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        department: department.trim(),
        rollNumber: rollNumber.trim(),
        employeeId: employeeId.trim(),
      };

      const result = await updateProfile(payload);

      if (result.success) {
        setSuccessMessage('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setErrorMessage(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDetails) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading user profile..." />
      </div>
    );
  }

  const role = user?.role || 'student';
  const roleVariant = role === 'admin' ? 'danger' : role === 'faculty' ? 'indigo' : 'primary';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personal details, department classification, and account credentials.
          </p>
        </div>

        {!isEditing && (
          <Button onClick={handleEditClick} size="sm" className="self-start sm:self-center">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-2 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-bold text-xl flex items-center justify-center shrink-0 uppercase shadow-2xs">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <Badge variant={roleVariant} className="capitalize">
                {role}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start space-x-1.5 pt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Department of {user?.department || 'General'}</span>
            </p>
          </div>
        </div>

        {/* Profile Content / Form */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Edit Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Email Address (Read-Only) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Read-Only</span>
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Role (Read-Only) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>System Role</span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Read-Only</span>
                  </span>
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={user?.role?.toUpperCase() || 'STUDENT'}
                    disabled
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-semibold cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              {/* Roll Number / Employee ID */}
              {role === 'student' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
                      placeholder="e.g. CS2026-042"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
                      placeholder="e.g. EMP-1092"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Account Credentials & Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  Full Name
                </span>
                <p className="text-xs font-medium text-slate-800 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span>{user?.name}</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  Email Address
                </span>
                <p className="text-xs font-medium text-slate-800 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{user?.email}</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  System Role
                </span>
                <p className="text-xs font-medium text-slate-800 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="capitalize">{user?.role}</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  Department
                </span>
                <p className="text-xs font-medium text-slate-800 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user?.department || 'Computer Science'}</span>
                </p>
              </div>

              {role === 'student' ? (
                <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/60 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Student Roll Number
                  </span>
                  <p className="text-xs font-medium text-slate-800 flex items-center space-x-1.5 font-mono">
                    <Hash className="w-3.5 h-3.5 text-amber-600" />
                    <span>{user?.profileInfo?.rollNumber || 'Not specified'}</span>
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/60 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Employee Identifier
                  </span>
                  <p className="text-xs font-medium text-slate-800 flex items-center space-x-1.5 font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>{user?.profileInfo?.employeeId || 'Not specified'}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
