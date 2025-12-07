const express = require("express");
const userFacade = require("./facade");
const userValidators = require("./validators");
const resHndlr = require("../../responseHandler");
const { userAuthenticateTkn } = require("../../middleware/authenticate");

const userRouter = express.Router();

userRouter
  .route("/")
  .get([userValidators.listUser, userAuthenticateTkn(1)], (req, res) => {
    userFacade
      .userList(req.body)
      .then((result) => resHndlr.sendSuccess(res, result, req))
      .catch((err) => resHndlr.sendError(res, err));
  });

userRouter.route("/profile").get([userAuthenticateTkn("all")], (req, res) => {
  Promise.resolve()
    .then(() => {
      if (!req.user) throw new Error("User not found in request");
      return resHndlr.sendSuccess(res, req.user, req);
    })
    .catch((err) => resHndlr.sendError(res, err));
});

userRouter
  .route("/create")
  .post(
    [userValidators.validateRegister, userAuthenticateTkn(1)],
    (req, res) => {
      userFacade
        .createUser(req.body)
        .then((result) => resHndlr.sendSuccess(res, result, req))
        .catch((err) => resHndlr.sendError(res, err));
    }
  );

userRouter
  .route("/profile")
  .put(
    [userValidators.updateUserProfile, userAuthenticateTkn("all")],
    (req, res) => {
      userFacade
        .updateUser({ update: req.body, userId: req.user._id })
        .then((result) => resHndlr.sendSuccess(res, result, req))
        .catch((err) => resHndlr.sendError(res, err));
    }
  );

userRouter
  .route("/:userId")
  .put(
    [userValidators.updateUserProfile, userAuthenticateTkn(1)],
    (req, res) => {
      userFacade
        .updateUser({ update: req.body, ...req.params })
        .then((result) => resHndlr.sendSuccess(res, result, req))
        .catch((err) => resHndlr.sendError(res, err));
    }
  );

module.exports = userRouter;
