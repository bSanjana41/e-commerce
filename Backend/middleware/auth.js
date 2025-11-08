import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token."
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid authentication token"
    });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
  next();
};

export const authorizeUser = (req, res, next) => {
  if (req.user.role !== "USER") {
    return res.status(403).json({
      success: false,
      message: "Access denied. User privileges required."
    });
  }
  next();
};

