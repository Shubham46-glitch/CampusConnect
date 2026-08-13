import React, { useState } from 'react';
import Button from '../Button';
import { UserCheck, UserMinus, Lock } from 'lucide-react';

const RegistrationButton = ({ event, currentUserId, userRole, onRegister, onCancel }) => {
  const [loading, setLoading] = useState(false);

  if (userRole !== 'student') {
    return null; // Only students register for events
  }

  const isRegistered = event.participants?.some(
    (p) => (typeof p === 'object' ? p._id : p) === currentUserId
  );
  const isFull = (event.participants?.length || 0) >= event.capacity;
  const isCancelled = event.status === 'cancelled';

  const handleRegister = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await onRegister(event._id);
    setLoading(false);
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await onCancel(event._id);
    setLoading(false);
  };

  if (isCancelled) {
    return (
      <span className="inline-flex items-center space-x-1 text-xs text-rose-500 font-medium">
        <Lock className="w-3.5 h-3.5" />
        <span>Event Cancelled</span>
      </span>
    );
  }

  if (isRegistered) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleCancel}
        className="text-rose-600 border-rose-200 hover:bg-rose-50"
      >
        <UserMinus className="w-3.5 h-3.5 mr-1" />
        {loading ? 'Cancelling...' : 'Cancel Registration'}
      </Button>
    );
  }

  if (isFull) {
    return (
      <span className="inline-flex items-center space-x-1 text-xs text-slate-400 font-medium italic">
        <Lock className="w-3.5 h-3.5" />
        <span>Capacity Full</span>
      </span>
    );
  }

  return (
    <Button size="sm" disabled={loading} onClick={handleRegister}>
      <UserCheck className="w-3.5 h-3.5 mr-1" />
      {loading ? 'Registering...' : 'Register'}
    </Button>
  );
};

export default RegistrationButton;
