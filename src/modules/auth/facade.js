const userService = require("../user/service");
const { getFirebaseAuth } = require("../../config/firebase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../jwtHandler");
const redisClient = require("../../redisClient/init");
const appUtils = require("../../utils/appUtils");
const custExc = require('../../customException')
//========================== Auth Service Functions =========================

const loginMapping = (params) => ({
  accessToken: params.jwt,
  exist: params?.info?.exist,
  ...params.info,
});

const _setRedisWithRes = (jwt, info, type) => {
  const userIdString = JSON.stringify(info._id);

  return redisClient.getValue(userIdString).then((tokenValue) => {
    if (tokenValue) {
      return redisClient.deleteValue(userIdString).then((set) => {
        return redisClient
          .setValue(userIdString, JSON.stringify(jwt))
          .then(() =>
            loginMapping({
              info,
              jwt,
              type,
            })
          );
      });
    } else {
      return redisClient.setValue(userIdString, JSON.stringify(jwt)).then(() =>
        loginMapping({
          info,
          jwt,
          type,
        })
      );
    }
  });
};

const registerUser = (userData) => {
  const { email, password, name, avatar, role, firebaseUid } = userData;

  // Check if user already exists in database
  const checkUserQuery = firebaseUid 
    ? { $or: [{ email }, { firebaseUid }] }
    : { email };

  return userService.getOne(checkUserQuery)
    .then((existingUser) => {
      if (existingUser) {
        throw custExc.completeCustomException("user_already_exists");
      }

      return Promise.resolve(getFirebaseAuth());
    })
    .then((firebaseAuth) => {
      if (firebaseUid) {
        return {
          uid: firebaseUid,
          email,
          displayName: name,
          photoURL: avatar,
        };
      }
      return firebaseAuth.createUser({
        email,
        password,
        displayName: name,
        photoURL: avatar,
      });
    })
    .then((firebaseUser) => {
      const userObj = {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        role,
        firebaseUid: firebaseUser.uid,
        status: true,
        isDeleted: false,
        lastLogin: new Date(),
      };

      if (password) {
        return bcrypt.hash(password, 10).then((hash) => {
          userObj.password = hash;
          return userService.saveUser(userObj);
        });
      }
      return userService.saveUser(userObj);
    })
    .then((user) => {
      appUtils.sanitizeUser(user);
      const token = generateToken(user.toObject?.() || user);
      return _setRedisWithRes(token, user.toObject?.() || user);
    })
    .catch((err) => {
      console.error("Error in registerUser:", err);
      throw err;
    });
};

const googleLogin = (userData) => {
  const { email, name, avatar, role, firebaseUid } = userData;

  return Promise.resolve(getFirebaseAuth())
    .then((firebaseAuth) => {
      if (firebaseUid) {
        return {
          uid: firebaseUid,
          email,
          displayName: name,
          photoURL: avatar,
        };
      }
      return firebaseAuth.createUser({
        email,
        displayName: name,
        photoURL: avatar,
      });
    })
    .then((firebaseUser) => {
      const userObj = {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        role,
        firebaseUid: firebaseUser.uid,
        status: true,
        isDeleted: false,
        lastLogin: new Date(),
      };

      return userService.getOne({ email: firebaseUser.email }).then((existingUser) => {
        if (existingUser) {
          if (!existingUser.status) {
            throw custExc.completeCustomException("inactive_user");
          }
          if (existingUser.isDeleted) {
            throw custExc.completeCustomException("deleted_user");
          }
        }

        return userService.findOneAndUpdate(
          { email: firebaseUser.email },
          { $set: userObj },
          { new: true, upsert: true }
        );
      });
    })
    .then((user) => {
      appUtils.sanitizeUser(user);
      const token = generateToken(user.toObject?.() || user);
      return _setRedisWithRes(token, user.toObject?.() || user);
    })
    .catch((err) => {
      console.error("Error in googleLogin:", err);
      throw err;
    });
};


const loginUser = (email, password) => {
  return userService
    .getOne({ email }, "+password")
    .then((user) => {
      if (!user) throw custExc.completeCustomException("usr_nt_exst");
      if (!user.status) {
        throw custExc.completeCustomException("inactive_user");
      }
      if (user.isDeleted) {
        throw custExc.completeCustomException("deleted_user");
      }

      if (!user.password) throw custExc.completeCustomException("no_pass");
      return bcrypt.compare(password, user.password).then((match) => {
        if (!match) throw new Error("Invalid credentials");
        return userService
          .findByIdAndUpdate(user._id, { lastLogin: new Date() })
          .then((user) => {
            appUtils.sanitizeUser(user);
            const token = generateToken(user.toObject?.() || user);
            return _setRedisWithRes(token, user.toObject?.() || user);
          });
      });
    });
};

const firebaseLogin = (firebaseUid) => {
  return userService
    .getOne({ firebaseUid, isDeleted: false, status: true })
    .then((user) => {
      if (!user) throw new Error("User not found");
      return userService
        .findByIdAndUpdate(user._id, { lastLogin: new Date() })
        .then((user) => {
          appUtils.sanitizeUser(user);
          const token = generateToken(user.toObject?.() || user);
          return _setRedisWithRes(token, user.toObject?.() || user);
        });
    });
};

const getByEmail = (email) => {
  return userService
    .findOne({ email, isDeleted: false, status: true })
    .then((user) => appUtils.sanitizeUser(user));
};

const getById = (id) => {
  return userService.findById(id).then((user) => appUtils.sanitizeUser(user));
};

//========================== Export Module Start =======================
module.exports = {
  registerUser,
  loginUser,
  firebaseLogin,
  getByEmail,
  getById,
  googleLogin,
};
//========================== Export Module End =========================
