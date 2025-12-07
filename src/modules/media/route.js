const express = require("express");
const router = express.Router();
const mediaFacade = require("./facade");
const responseHandler = require("../../responseHandler");
const {
  userAuthenticateTkn,
  optionalUserAuthenticatioTkn,
} = require("../../middleware/authenticate");

router.get("/", [userAuthenticateTkn("all")], (req, res) => {
  const userId = req.user._id || req.user.user_id;
  return mediaFacade
    .getMediaList(req.query, userId)
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.get("/trashed", [userAuthenticateTkn("all")], (req, res) => {
  const userId = req.user._id || req.user.user_id;
  const info = { ...req.query };
  return mediaFacade
    .getTrashedMediaList(info, userId)
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.get("/shared/with-me", [userAuthenticateTkn("all")], (req, res) => {
  const email = req.user.email;
  const info = {
    "sharedWith.email": email.toLowerCase(),
    ...req.query,
    isDeleted: false,
  };
  return mediaFacade
    .getSharedFiles(info)
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.get("/:id", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;
  return mediaFacade
    .downloadFile(fileId, req.user)
    .then((media) => {
      return responseHandler.sendSuccess(res, media, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router
  .route("/:id/details")
  .get(optionalUserAuthenticatioTkn("all"), (req, res) => {
    const fileId = req.params.id;

    return mediaFacade
      .getFileAccess(fileId, req.user)
      .then((result) => {
        return responseHandler.sendSuccess(res, result, req);
      })
      .catch((error) => {
        return responseHandler.sendError(res, error);
      });
  });

router.delete("/:id", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;

  return mediaFacade
    .deleteFile(fileId, req.user)
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.put("/:id/restore", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;
  const userId = req.user._id || req.user.user_id;

  return mediaFacade
    .restoreMedia(fileId, userId)
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.delete("/:id/permanent", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;
  const userId = req.user._id || req.user.user_id;

  return mediaFacade
    .permanentDeleteMedia(fileId, userId)
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.post("/:id/share/users", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;
  const { emails, permission, expiresAt, isPublic } = req.body;

  const promises = [];

  if (Array.isArray(emails) && emails.length > 0) {
    emails.forEach((email) => {
      promises.push(
        mediaFacade.controlAccess(fileId, req.user, {
          email,
          permission,
          expiresAt,
          isPublic,
        })
      );
    });
  } else if (isPublic !== undefined) {
    promises.push(
      mediaFacade.controlAccess(fileId, req.user, {
        isPublic,
      })
    );
  }

  if (promises.length === 0) {
    return responseHandler.sendError(
      res,
      { message: "No changes requested" },
      400
    );
  }

  return Promise.all(promises)
    .then((result) => {
      return responseHandler.sendSuccess(
        res,
        { message: "Access updated successfully" },
        req
      );
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.put("/:id/share/user", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;
  const { email, permission, expiresAt } = req.body;

  return mediaFacade
    .editAccess(fileId, req.user, { email, permission, expiresAt })
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

router.delete("/:id/share/user", [userAuthenticateTkn("all")], (req, res) => {
  const fileId = req.params.id;
  const { email } = req.body;

  return mediaFacade
    .revokeAccess(fileId, req.user, { email })
    .then((result) => {
      return responseHandler.sendSuccess(res, result, req);
    })
    .catch((error) => {
      return responseHandler.sendError(res, error);
    });
});

module.exports = router;
