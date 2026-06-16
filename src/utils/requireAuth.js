import jwt from "jsonwebtoken";

/* =========================
   AUTH MIDDLEWARE
========================= */
export const requireAuth = (req, res, next) => {
  try {
    console.log("AUTH HEADER:", req.headers.authorization);
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    console.log("USER SET:", req.user);

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* =========================
   ROLE BASED ACCESS
========================= */
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    console.log("REQ USER FULL:", req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const role = req.user.role?.toLowerCase();

    const allowed = roles.map((r) => r.toLowerCase());

    console.log("ROLE CHECK:", { role, allowed });

    if (!allowed.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
