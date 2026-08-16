import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Students Roster with Search, Department Filter, Status Filter & Pagination
// @route   GET /api/users/students
// @access  Private (Admin or Faculty for their department)
export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'student' };

    const escapeRegex = (text) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // SECURITY ENFORCEMENT: Faculty members are strictly locked to THEIR OWN department.
    if (req.user.role === 'faculty' && req.user.department) {
      query.department = new RegExp(`^${escapeRegex(req.user.department.trim())}$`, 'i');
    } else if (req.user.role === 'admin' && req.query.department && req.query.department !== 'all') {
      query.department = new RegExp(`^${escapeRegex(req.query.department.trim())}$`, 'i');
    }

    // Search filter across name, email, department, rollNumber
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { 'profileInfo.rollNumber': searchRegex },
      ];
    }

    // Status Filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Faculty Roster with Search, Department Filter, Status Filter & Pagination
// @route   GET /api/users/faculty
// @access  Private/Admin
export const getFaculty = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'faculty' };

    // Search filter across name, email, department, employeeId
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { 'profileInfo.employeeId': searchRegex },
      ];
    }

    // Department Filter
    if (req.query.department && req.query.department !== 'all') {
      query.department = req.query.department;
    }

    // Status Filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (active / inactive)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be active or inactive.' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    try {
      if (typeof logActivity === 'function') {
        await logActivity({
          action: 'USER_STATUS_UPDATED',
          performedBy: req.user._id,
          details: `Updated account status for ${user.name} (${user.email}) to ${status}`,
          targetId: user._id,
          targetType: 'User',
        });
      }
    } catch (logErr) {
      console.error('[UserController] Activity logging ignored failure:', logErr.message);
    }

    res.json({
      message: `User account status updated to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user department (Admin only)
// @route   PATCH /api/users/:id/department
// @access  Private/Admin
export const updateUserDepartment = async (req, res, next) => {
  try {
    const { department } = req.body;
    if (!department || !department.trim()) {
      return res.status(400).json({ message: 'Department is required' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldDept = user.department;
    user.department = department.trim();
    await user.save();

    try {
      if (typeof logActivity === 'function') {
        await logActivity({
          action: 'USER_DEPARTMENT_UPDATED',
          performedBy: req.user._id,
          details: `Updated department for ${user.name} (${user.email}) from "${oldDept}" to "${user.department}"`,
          targetId: user._id,
          targetType: 'User',
        });
      }
    } catch (logErr) {
      console.error('[UserController] Activity logging ignored failure:', logErr.message);
    }

    res.json({
      message: `User department updated to ${user.department}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      // Do NOT allow non-admins to arbitrary self-change department if locked
      if (req.body.department && req.user.role === 'admin') {
        user.department = req.body.department;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.profileInfo) {
        user.profileInfo = { ...user.profileInfo, ...req.body.profileInfo };
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        status: updatedUser.status || 'active',
        profileInfo: updatedUser.profileInfo,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      try {
        if (typeof logActivity === 'function') {
          await logActivity({
            action: 'USER_DELETED',
            performedBy: req.user._id,
            details: `Deleted user account: ${user.name} (${user.email})`,
            targetId: user._id,
            targetType: 'User',
          });
        }
      } catch (logErr) {
        console.error('[UserController] Activity logging ignored failure:', logErr.message);
      }
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

