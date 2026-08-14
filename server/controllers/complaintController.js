import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get complaints for authenticated user (Student sees own, Admin sees all)
// @route   GET /api/complaints
// @access  Private (All authenticated users)
export const getComplaints = async (req, res, next) => {
  try {
    const { role, department } = req.user;
    let query = {};

    if (role === 'student') {
      query = { submittedBy: req.user._id };
    } else if (role === 'faculty') {
      query = { department: department };
    } // Admin sees all complaints

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email department profileInfo')
      .populate('assignedTo', 'name email role department')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (Owner Student, Department Faculty, or Admin)
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email department profileInfo')
      .populate('assignedTo', 'name email role department profileInfo');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Access check
    const isOwner = complaint.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isDeptFaculty = req.user.role === 'faculty' && complaint.department === req.user.department;

    if (!isOwner && !isAdmin && !isDeptFaculty) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view this complaint' });
    }

    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student only)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, department } = req.body;

    if (!title || !description || !department) {
      return res.status(400).json({ message: 'Please provide complaint title, description, and department' });
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'academic',
      priority: priority || 'medium',
      department: department.trim(),
      submittedBy: req.user._id, // Set automatically from authenticated user token
      status: 'pending',
      assignedTo: null,
    });

    // Notify student owner confirming submission
    await createNotification({
      recipient: req.user._id,
      title: 'Complaint Submitted',
      message: `Your complaint "${title.trim()}" has been submitted successfully.`,
      type: 'complaint',
      relatedId: complaint._id,
      relatedType: 'Complaint',
    });

    // Notify admins about new complaint
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      if (admin._id.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: admin._id,
          title: 'New Complaint Submitted',
          message: `A new complaint "${title.trim()}" has been submitted.`,
          type: 'complaint',
          relatedId: complaint._id,
          relatedType: 'Complaint',
        });
      }
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email department profileInfo');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint details (Student: pending only, Admin: any)
// @route   PUT /api/complaints/:id
// @access  Private (Owner Student or Admin)
export const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = complaint.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to update this complaint' });
    }

    // Student restriction: Can only update while status is pending
    if (isOwner && !isAdmin && complaint.status !== 'pending') {
      return res.status(400).json({
        message: 'Cannot modify complaint once processing has started (status is no longer pending)',
      });
    }

    complaint.title = req.body.title ? req.body.title.trim() : complaint.title;
    complaint.description = req.body.description ? req.body.description.trim() : complaint.description;
    complaint.category = req.body.category || complaint.category;
    complaint.priority = req.body.priority || complaint.priority;
    complaint.department = req.body.department ? req.body.department.trim() : complaint.department;

    // Admin can also update adminResponse
    if (isAdmin && req.body.adminResponse !== undefined) {
      complaint.adminResponse = req.body.adminResponse.trim();
    }

    const updatedComplaint = await complaint.save();
    const populatedComplaint = await Complaint.findById(updatedComplaint._id)
      .populate('submittedBy', 'name email department profileInfo')
      .populate('assignedTo', 'name email role department');

    res.json(populatedComplaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Student: pending only, Admin: any)
// @route   DELETE /api/complaints/:id
// @access  Private (Owner Student or Admin)
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = complaint.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this complaint' });
    }

    // Student restriction: Can only delete while status is pending
    if (isOwner && !isAdmin && complaint.status !== 'pending') {
      return res.status(400).json({
        message: 'Cannot delete complaint once processing has started (status is no longer pending)',
      });
    }

    await Complaint.deleteOne({ _id: complaint._id });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & official admin response
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin only)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    complaint.status = status;

    if (adminResponse !== undefined) {
      complaint.adminResponse = adminResponse.trim();
    }

    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    } else {
      complaint.resolvedAt = undefined;
    }

    const updatedComplaint = await complaint.save();

    // Log system activity
    await logActivity({
      action: 'COMPLAINT_STATUS_UPDATED',
      performedBy: req.user._id,
      details: `Updated complaint status for "${complaint.title}" to ${status}`,
      targetId: complaint._id,
      targetType: 'Complaint',
    });


    // Format notification title & message
    const formattedStatus =
      status === 'in_progress'
        ? 'In Progress'
        : status.charAt(0).toUpperCase() + status.slice(1);

    const isResolved = status === 'resolved';
    const notifTitle = isResolved ? 'Complaint Resolved' : 'Complaint Status Updated';
    const notifMsg = isResolved
      ? `Your complaint "${complaint.title}" has been resolved successfully.`
      : `The status of your complaint "${complaint.title}" has been updated to "${formattedStatus}".`;

    // Notify complaint owner student
    await createNotification({
      recipient: complaint.submittedBy,
      title: notifTitle,
      message: notifMsg,
      type: 'complaint',
      relatedId: complaint._id,
      relatedType: 'Complaint',
    });

    const populatedComplaint = await Complaint.findById(updatedComplaint._id)
      .populate('submittedBy', 'name email department profileInfo')
      .populate('assignedTo', 'name email role department');

    res.json(populatedComplaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to an Admin user
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin only)
export const assignComplaint = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (assignedTo) {
      const targetUser = await User.findById(assignedTo);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target assigned user not found' });
      }
      complaint.assignedTo = targetUser._id;
    } else {
      complaint.assignedTo = null;
    }

    const updatedComplaint = await complaint.save();
    const populatedComplaint = await Complaint.findById(updatedComplaint._id)
      .populate('submittedBy', 'name email department profileInfo')
      .populate('assignedTo', 'name email role department');

    res.json(populatedComplaint);
  } catch (error) {
    next(error);
  }
};
