// Role-based authorization middleware

export const providerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "provider") {
    return res.status(403).json({ message: "Access denied: Ride Providers only" });
  }
  next();
};

export const seekerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "seeker") {
    return res.status(403).json({ message: "Access denied: Ride Seekers only" });
  }
  next();
};
