const appUtils = require("../../utils/appUtils");
const mediaService = require("./service");
const successMsg = require("../../success_msg.json");
const custExc = require("../../customException");

const downloadFile = (fileId, user) => {
  return mediaService
    .getOne({ _id: fileId, isDeleted: false })
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }

      const isOwner = media.owner.email === user?.email.toLowerCase();
      const isShared = media.sharedWith.some(
        (share) => share.email === user?.email.toLowerCase()
      );
      const isPublic = media.isPublic;

      if (!isOwner && !isShared && !isPublic) {
        throw custExc.completeCustomException("access_denied");
      }

      const auditUser = user || { email: "unknown@email.com", id: null };
      return media.addAuditLog("access", auditUser).then(() => ({
        fileUrl: media.fileUrl,
        mimeType: media.mimeType,
        originalName: media.originalName,
        size: media.size,
      }));
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "downloadFile",
        err: error,
      });
      throw error;
    });
};

const deleteFile = (fileId, user) => {
  const query = {
    _id: fileId,
    "owner.userId": user._id,
    isDeleted: false,
  };
  const update = {
    isDeleted: true,
  };

  return mediaService
    .findOneAndUpdate(query, update)
    .then((result) => {
      if (!result) {
        throw custExc.completeCustomException("file_not_found");
      }
      return {
        message: successMsg.file_deleted || "File deleted successfully",
      };
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "deleteFile",
        err: error,
      });
      throw error;
    });
};

const getMediaList = (info, userId) => {
  info["owner.userId"] = userId;
  info.isDeleted = false;

  return mediaService
    .MediaList(info, true)
    .countDocuments()
    .then((total) => {
      this.total = total;
      let list = mediaService.MediaList(info);
      return appUtils.sorting(list, info);
    })
    .then((media) => ({ total: this.total, media }))
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "getMediaList",
        err: error,
      });
      throw error;
    });
};

const getTrashedMediaList = (info, userId) => {
  info["owner.userId"] = userId;
  info["isDeleted"] = true;

  return mediaService
    .MediaList(info, true)
    .countDocuments()
    .then((total) => {
      this.total = total;
      let list = mediaService.MediaList(info);
      return appUtils.sorting(list, info);
    })
    .then((media) => ({ total: this.total, media }))
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "getTrashedMediaList",
        err: error,
      });
      throw error;
    });
};

const getSharedFiles = (info) => {
  return mediaService
    .MediaList(info, true)
    .countDocuments()
    .then((total) => {
      this.total = total;
      let list = mediaService.MediaList(info);
      return appUtils.sorting(list, info);
    })
    .then((media) => ({ total: this.total, media }))
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "getSharedFiles",
        err: error,
      });
      throw error;
    });
};

const controlAccess = (fileId, user, info) => {
  const query = {
    _id: fileId,
    "owner.userId": user._id,
    isDeleted: false,
  };

  let update = {};

  if (info.isPublic !== undefined) {
    update.$set = { isPublic: info.isPublic };
  }

  if (info.email) {
    const shareObj = {
      email: info.email.toLowerCase(),
      permission: info.permission || "download",
      expiresAt: info.expiresAt || null,
      sharedAt: new Date(),
    };
    update.$addToSet = { sharedWith: shareObj };
  }

  return mediaService
    .findOneAndUpdate(query, update)
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }
      return media.addAuditLog("access_control", user, info).then(() => media);
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "controlAccess",
        err: error,
      });
      throw error;
    });
};

const editAccess = (fileId, user, info) => {
  const query = {
    _id: fileId,
    "owner.userId": user._id,
    isDeleted: false,
    "sharedWith.email": info.email.toLowerCase(),
  };

  const update = {
    $set: {
      "sharedWith.$.permission": info.permission,
      "sharedWith.$.expiresAt": info.expiresAt || null,
    },
  };

  return mediaService
    .findOneAndUpdate(query, update)
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException(
          "file_not_found_or_user_not_shared"
        );
      }
      return media.addAuditLog("edit_access", user, info).then(() => media);
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "editAccess",
        err: error,
      });
      throw error;
    });
};

const revokeAccess = (fileId, user, info) => {
  const query = {
    _id: fileId,
    "owner.userId": user._id,
    isDeleted: false,
  };

  const update = {
    $pull: { sharedWith: { email: info.email.toLowerCase() } },
  };

  return mediaService
    .findOneAndUpdate(query, update)
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }
      return media.addAuditLog("revoke_access", user, info).then(() => media);
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "revokeAccess",
        err: error,
      });
      throw error;
    });
};

const getFileAccess = (fileId, user) => {
  return mediaService
    .getOne({ _id: fileId, isDeleted: false })
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }

      const isOwner = media?.owner?.email === user?.email.toLowerCase();
      const isShared = media?.sharedWith?.some(
        (share) => share.email === user?.email.toLowerCase()
      );
      const isPublic = media?.isPublic;

      if (!isOwner && !isShared && !isPublic) {
        throw custExc.completeCustomException("access_denied");
      }

      return {
        hasAccess: true,
        accessType: isOwner ? "owner" : isShared ? "shared" : "public",
        media,
      };
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "getFileAccess",
        err: error,
      });
      throw error;
    });
};

const getSecureFileStream = (fileId, user) => {
  return mediaService
    .getOne({ _id: fileId, isDeleted: false })
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }

      const isOwner = user && media.owner.email === user?.email.toLowerCase();
      const isShared =
        user &&
        media.sharedWith.some(
          (share) => share.email === user?.email.toLowerCase()
        );
      const isPublic = media.isPublic;

      if (!isOwner && !isShared && !isPublic) {
        throw custExc.completeCustomException("access_denied");
      }

      return {
        fileUrl: media.fileUrl,
        mimeType: media.mimeType,
        originalName: media.originalName,
        size: media.size,
      };
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "getSecureFileStream",
        err: error,
      });
      throw error;
    });
};

const restoreMedia = (mediaId, userId) => {
  return mediaService
    .findOneAndUpdate(
      { _id: mediaId, "owner.userId": userId, isDeleted: true },
      { isDeleted: false }
    )
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }
      return media
        .addAuditLog("restore_media", userId, { mediaId, userId })
        .then(() => media);
    })
    .then((media) => {
      return { message: "File restored successfully", media };
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "restoreMedia",
        err: error,
      });
      throw error;
    });
};

const permanentDeleteMedia = (mediaId, userId) => {
  return mediaService
    .getOne({ _id: mediaId, "owner.userId": userId, isDeleted: true })
    .then((media) => {
      if (!media) {
        throw custExc.completeCustomException("file_not_found");
      }
      const cloudinary = require("../../services/uploadDeleteToCloudinary");
      return cloudinary.deleteFromCloudinary(media.fileKey).then(() => {
        return mediaService.deleteOne({ _id: mediaId });
      });
    })
    .then(() => {
      return { message: "File permanently deleted" };
    })
    .catch((error) => {
      appUtils.logError({
        moduleName: "Media",
        methodName: "permanentDeleteMedia",
        err: error,
      });
      throw error;
    });
};

module.exports = {
  downloadFile,
  deleteFile,
  getMediaList,
  getSharedFiles,
  controlAccess,
  editAccess,
  revokeAccess,
  getFileAccess,
  getSecureFileStream,
  getTrashedMediaList,
  restoreMedia,
  permanentDeleteMedia,
};
