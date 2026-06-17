import jwt from "jsonwebtoken";

/* =========================
   AUTH MIDDLEWARE (HTTP-ONLY COOKIES)
========================= */
export const requireAuth = (req, res, next) => {
  try {
    // 1. Inspect the cookie container instead of req.headers.authorization
    console.log("ALL COOKIES:", req.cookies);
    const token = req.cookies?.token;

    console.log("EXTRACTED COOKIE TOKEN:", token);

    // If the cookie isn't attached, stop the conveyor belt here
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2. Cryptographically verify the cookie payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Mount the payload details onto the request object
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
   ROLE BASED ACCESS (Stays Identical)
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
