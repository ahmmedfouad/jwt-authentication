function authorizeRoles(...roles) {
  return (req, res, next) => {
      console.log('User Role:', req.user.role); // Debugging line
      console.log('Allowed Roles:', roles);     // Debugging line
      if (!roles.includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied' });
      }
      next();
  };
}

module.exports = authorizeRoles;
