export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role (${req.user.role}) is not authorized to access this resource`,
      });
    }

    next();
  };
};

// Require single or multiple roles helper
export const requireRole = (role) => authorizeRoles(role);
