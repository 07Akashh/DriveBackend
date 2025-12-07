const appUtils = require("../../utils/appUtils");
const userService = require("./service");
const successMsg = require('../../success_msg.json');
const { getFirebaseAuth } = require("../../config/firebase");
const bcrypt = require("bcryptjs");
const custExc = require('../../customException')

//========================== Auth Service Functions =========================

const userList = (info) => {
  return userService
    .UserList(info, true)
    .countDocuments()
    .then((total) => {
      this.total = total;
      let list = userService.UserList(info);
      return appUtils.sorting(list, info);
    })
    .then((users) => ({ total: this.total, users }))
    .catch((err) => {
      appUtils.logError({
        moduleName: "Users",
        methodName: "userList",
        err,
      });
      throw err;
    });
};


const updateUser = (info) => {
  return userService.findByIdAndUpdate({ _id: info.userId }, info.update)
      .then((user) => {
          if (!user) {
              throw custExc.completeCustomException("usr_nt_exst");
          }
          return successMsg.user_update;
      })
      .catch((err) => {
          appUtils.logError({moduleName:"User" , methodName : "UpdateUser",err });
          throw err;
      });
};


const createUser = (userData) => {
  const { email, password, name, avatar, role, firebaseUid } = userData;

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
    return appUtils.sanitizeUser(user);
    })
    .catch((err) => {
      console.error("Error in registerUser:", err);
      throw err;
    });
};
//========================== Export Module Start =======================
module.exports = {
  userList,
  updateUser,
  createUser
};
//========================== Export Module End =========================
