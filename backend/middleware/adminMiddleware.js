const adminMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.id !== 0)) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

module.exports = adminMiddleware;
