const mongoose = require("mongoose");
const constant = require("../../constant");

const MediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    compressedSize: {
      type: Number,
    },
    uploadProvider: {
      type: String,
      enum: ["s3", "cloudinary"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileKey: {
      type: String,
      required: true,
    },
    folder: {
      type: String,
      default: "/",
    },
    isCompressed: {
      type: Boolean,
      default: false,
    },
    owner: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
    },
    sharedWith: [
      {
        email: {
          type: String,
          lowercase: true,
          required: true,
        },
        permission: {
          type: String,
          enum: ["view", "download"],
          default: "download",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    auditLog: [
      {
        action: {
          type: String,
          enum: [
            "upload",
            "download",
            "share",
            "unshare",
            "delete",
            "access",
            "access_control",
            "restore_media",
          ],
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        email: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.fileUrl;
        delete ret.fileKey;
        ret.streamUrl = `proxy/media/${ret._id}/stream`;
        ret.downloadUrl = `proxy/media/${ret._id}/download`;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

MediaSchema.index({ "owner.userId": 1, isDeleted: 1 });
MediaSchema.index({ "sharedWith.email": 1 });
MediaSchema.index({ uploadedAt: -1 });

MediaSchema.methods.addAuditLog = function (action, user, metadata = {}) {
  this.auditLog.push({
    action,
    user: user?._id || null,
    email: user?.email || null,
    timestamp: new Date(),
    metadata,
  });
  return this.save();
};

MediaSchema.methods.hasAccess = function (userId, userEmail) {
  if (this.owner.userId.toString() === userId.toString()) {
    return true;
  }

  const sharedEntry = this.sharedWith.find((share) => {
    const matchesEmail = share.email === userEmail.toLowerCase();
    const notExpired =
      !share.expiresAt || new Date(share.expiresAt) > new Date();

    return matchesEmail && notExpired;
  });

  return !!sharedEntry;
};

MediaSchema.methods.shareWithUser = function (
  email,
  permission = "download",
  expiresAt = null
) {
  const existingShare = this.sharedWith.find(
    (share) => share.email === email.toLowerCase()
  );

  if (existingShare) {
    existingShare.permission = permission;
    existingShare.expiresAt = expiresAt;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      email: email.toLowerCase(),
      permission,
      sharedAt: new Date(),
      expiresAt,
    });
  }

  return this.save();
};

MediaSchema.methods.removeShare = function (email) {
  this.sharedWith = this.sharedWith.filter((share) => {
    return share.email !== email.toLowerCase();
  });

  return this.save();
};

module.exports = mongoose.model(
  constant.DB_MODEL_REF.MEDIA || "Media",
  MediaSchema
);
