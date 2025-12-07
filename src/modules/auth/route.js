const authRouter = require("express").Router();
const resHndlr = require("../../responseHandler");
const authFacade = require("./facade");
const validators = require("./validators");
const middleware = require("../../middleware");
const { expireToken } = require("../../jwtHandler");
const uploadDeleteToBlob = require("../../services/uploadDeleteToBlob");
const { userAuthenticateTkn } = require("../../middleware/authenticate");
const { verifyFirebaseToken } = require("../../middleware/auth");

authRouter.route("/signup").post([validators.validateRegister], (req, res) => {
  authFacade
    .registerUser(req.body)
    .then((result) => resHndlr.sendSuccess(res, result, req))
    .catch((err) => resHndlr.sendError(res, err));
});

authRouter.route("/social").post([verifyFirebaseToken], (req, res) => {
  const info = req.decodedToken;
  authFacade
    .googleLogin({
      email: info.email,
      name: info.name,
      avatar: info.picture,
      firebaseUid: info.uid,
    })
    .then((result) => resHndlr.sendSuccess(res, result, req))
    .catch((err) => resHndlr.sendError(res, err));
});

authRouter.route("/login").post([validators.validateLogin], (req, res) => {
  const { email, password } = req.body;
  authFacade
    .loginUser(email, password)
    .then((result) => resHndlr.sendSuccess(res, result, req))
    .catch((err) => resHndlr.sendError(res, err));
});

authRouter.route("/logout").post([userAuthenticateTkn("all")], (req, res) => {
  expireToken(req);
  resHndlr.sendSuccess(res, req.user, req);
});

// Forgot Password
// authRouter.route("/forgot-password").post([
//   validators.validateForgotPassword
// ], (req, res) => {
//   authFacade.sendPasswordResetEmail(req.body.email)
//     .then(result => resHndlr.sendSuccess(res, result, req))
//     .catch(err => resHndlr.sendError(res, err));
// });

// Change Password
// authRouter.route("/change-password").post([
//   userAuthenticateTkn('all'),
//   validators.validateChangePassword
// ], (req, res) => {
//   // Assuming req.user is set by the authentication middleware
//   authFacade.changePassword(req.user._id, req.body.newPassword)
//     .then(result => resHndlr.sendSuccess(res, result, req))
//     .catch(err => resHndlr.sendError(res, err));
// });

module.exports = authRouter;
