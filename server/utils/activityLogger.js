import ActivityLog from '../models/ActivityLog.js';

/**
 * Asynchronously record an activity log in the database.
 * Does not block execution flow.
 */
export const logActivity = async ({ action, performedBy, details, targetId = null, targetType = '', ipAddress = '' }) => {
  try {
    if (!performedBy) return;
    await ActivityLog.create({
      action,
      performedBy,
      details,
      targetId,
      targetType,
      ipAddress,
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to record activity:', err.message);
  }
};
