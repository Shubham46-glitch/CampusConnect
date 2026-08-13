import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User, Target, Clock, ShieldAlert } from 'lucide-react';
import { CategoryBadge, PriorityBadge } from '../../components/announcements/AnnouncementBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { getAnnouncementById, deleteAnnouncement } from '../../services/announcementService';
import useAuth from '../../hooks/useAuth';

const AnnouncementDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncementById(id);
        setAnnouncement(data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Announcement not found or access forbidden.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      try {
        setDeleteLoading(true);
        await deleteAnnouncement(id);
        navigate('/announcements');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete announcement');
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading announcement details..." />;
  }

  if (error || !announcement) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl inline-block text-xs font-semibold">
          {error || 'Announcement not found'}
        </div>
        <div>
          <Link to="/announcements">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Noticeboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = announcement.publishedBy?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canModify = isCreator || isAdmin;

  const isExpired = announcement.status === 'expired' || (announcement.expiresAt && new Date(announcement.expiresAt) < new Date());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between">
        <Link to="/announcements" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Noticeboard</span>
        </Link>

        {canModify && (
          <div className="flex items-center space-x-2">
            <Link to={`/announcements/${announcement._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" size="sm" disabled={deleteLoading} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Notice Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3">
            <CategoryBadge category={announcement.category} />
            <PriorityBadge priority={announcement.priority} />
            {isExpired && (
              <Badge variant="danger" className="text-[10px]">
                Expired
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{announcement.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Published by <strong className="ml-1 text-slate-700">{announcement.publishedBy?.name || 'Administrator'}</strong>
            </span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
            </span>
            {announcement.expiresAt && (
              <span className="flex items-center text-amber-600 font-medium">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Target Audience Metadata */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center space-x-1.5 font-medium">
            <Target className="w-4 h-4 text-brand-600" />
            <span>Target Audience: <strong className="capitalize text-slate-800">{announcement.targetAudience}</strong></span>
          </span>
          {announcement.targetAudience === 'department' && (
            <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
              Dept: {announcement.department}
            </span>
          )}
        </div>

        {/* Notice Content */}
        <div className="prose max-w-none text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line">
          {announcement.content}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailsPage;
