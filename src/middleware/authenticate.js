"use strict";
//========================== Load Modules Start ===========================

//========================== Load internal Module =========================
const exceptions = require("../customException.js");
const jwtHandler = require("../jwtHandler");
const userService = require("../modules/user/service.js");
const appUtils = require("../utils/appUtils.js");

//========================== Load Modules End =============================
//

//internal function for chek payload
const checkPyaload = (payload, onlyVaildFor) => {
  let service;
  if (payload.role === onlyVaildFor || onlyVaildFor === "all") {
    service = userService.getByIduser({ user_id: payload._id });
  }
  return service;
};

///check Token Expiration

const checkTokenExpiration = (admin, payload) => {
  if (admin.lastPassChnage) {
    if (new Date(admin.lastPassChnage) > new Date(payload.created)) {
      throw exceptions.completeCustomException("session_expire");
    }
  }
};

var expireToken = (req, _res, next) =>
  jwtHandler
    .expireToken(req)
    .then((_result) => {
      //return result;
      next();
    })
    .catch((err) => {
      appUtils.logError({
        moduleName: "middleware-authenticate",
        methodName: "expireToken",
        err,
      });
      next(err);
    });

const userAuthenticateTkn = (onlyValidFor) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.accessToken || req.get("accessToken");

    if (!token) {
      return next(exceptions.unauthorizeAccess());
    }

    jwtHandler
      .verifyToken(token)
      .then((payload) => {
        req.payload = payload;
        if (payload.role !== onlyValidFor && onlyValidFor !== "all") {
          throw exceptions.unauthorizeAccess();
        }
        return checkPyaload(payload, onlyValidFor);
      })
      .then((user) => {
        if (!user) throw exceptions.completeCustomException("usr_nt_exst");
        // checkTokenExpiration(user, req.payload);
        req.user = user;
        req.role = req.payload.role;
        req.body.type = req.payload.type;
        next();
      })
      .catch((err) => {
        appUtils.logError({
          moduleName: "middleware-authenticate",
          methodName: "userAuthenticateTkn",
          err,
        });
        next(err);
      });
  };
};

const optionalUserAuthenticatioTkn = (onlyValidFor) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.accessToken ||
          req.query?.token ||
          req.get("accessToken");

    if (!token) {
      req.user = null;
      req.role = null;
      return next();
    }

    jwtHandler
      .verifyToken(token)
      .then((payload) => {
        req.payload = payload;
        if (payload.role !== onlyValidFor && onlyValidFor !== "all") {
          req.user = null;
          req.role = null;
          return null;
        }
        return checkPyaload(payload, onlyValidFor);
      })
      .then((user) => {
        if (user) {
          req.user = user;
          req.role = req.payload.role;
          req.body.type = req.payload.type;
        } else {
          req.user = null;
          req.role = null;
        }
        next();
      })
      .catch((err) => {
        appUtils.logError({
          moduleName: "middleware-authenticate",
          methodName: "optionalUserAuthenticatioTkn",
          err,
        });
        req.user = null;
        req.role = null;
        next();
      });
  };
};

var verifyClientSecreate = (req, _res, next) => {
  var clientSecret = req.body.clientSecret;
  if (clientSecret != "Mi6lhaR10HyWOxjMqITx3ONWHFkTcHuebIZPYNi1") {
    throw exceptions.invalidClientSecreate();
  }
  next();
};

//========================== Export Module Start ===========================

module.exports = {
  userAuthenticateTkn,
  expireToken,
  verifyClientSecreate,
  optionalUserAuthenticatioTkn,
};

//========================== Export Module End ===========================
