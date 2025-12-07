const { getFirebaseAuth } = require("../config/firebase");
const jwt = require("jsonwebtoken");
const userService = require("../modules/user/service");
const Session = require("../modules/auth/model");
const jwtHandler = require("../jwtHandler");

const verifyIdToken = (idToken) => {
  return getFirebaseAuth()
    .then((firebaseAuth) => firebaseAuth.verifyIdToken(idToken))
    .then((decodedToken) => {
      return userService
        .getOne({
          firebaseUid: decodedToken.uid,
          isDeleted: false,
          status: true,
        })
        .then((user) => {
          // if (!user) throw new Error("User not found");
          return { user, decodedToken };
        });
    });
};

const verifySession = (token) => {
  let decoded;
  return new Promise((resolve, reject) => {
    jwtHandler.verifyToken(token, (err, d) => {
      if (err) return reject(new Error("Invalid token"));
      decoded = d;
      resolve();
    });
  })
    .then(() => {
      return Session.findOne({ token, isActive: true }).lean();
    })
    .then((session) => {
      if (!session) throw new Error("Session not found or expired");
      return userService.findById(session.userId).then((user) => {
        if (!user) throw new Error("User not found");
        return { user, session, decoded };
      });
    });
};

module.exports = {
  verifyIdToken,
  verifySession,
};
