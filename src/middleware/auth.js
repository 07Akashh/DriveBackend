const AuthService = require("../services/AuthService");
const exceptions = require("../customException.js");

/**
 * Middleware to verify Firebase ID token
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const idToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split("Bearer ")[1]
        : req.get("fbToken");
    if (!idToken) {
      return next(exceptions.completeCustomException("no_token"));
    }
    const result = await AuthService.verifyIdToken(idToken);

    req.user = result.user;
    req.decodedToken = result.decodedToken;
    next();
  } catch (error) {
    console.log(error)
    return next(exceptions.completeCustomException("invalid_token"));
  }
};

/**
 * Middleware to verify session token
 */
const verifySessionToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];
    const result = await AuthService.verifySession(token);

    req.user = result.user;
    req.session = result.session;
    req.decoded = result.decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid session",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user has specific custom claims
 */
const requireClaims = (requiredClaims) => {
  return (req, res, next) => {
    if (!req.decodedToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userClaims = req.decodedToken.customClaims || {};

    for (const claim of requiredClaims) {
      if (!userClaims[claim]) {
        return res.status(403).json({
          success: false,
          message: `Missing required claim: ${claim}`,
        });
      }
    }

    next();
  };
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = requireClaims(["admin"]);

/**
 * Middleware to check if user email is verified
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user || !req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required",
    });
  }
  next();
};

/**
 * Optional authentication middleware
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1];
      const result = await AuthService.verifyIdToken(idToken);
      req.user = result.user;
      req.decodedToken = result.decodedToken;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  verifyFirebaseToken,
  // verifySessionToken,
  requireClaims,
  requireAdmin,
  requireEmailVerified,
  optionalAuth,
};
