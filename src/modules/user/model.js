const mongoose = require("mongoose");
const constant = require("../../constant");
const UserProfileSchema = new mongoose.Schema(
  {
    role: {
      type: Number,
      enum: [1, 2],
      default: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    firebaseUid: {
      type: String,
      required: false,
      index: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastUpdate: {},
    storageUsed: {
      type: Number,
      default: 0,
      // Storage in bytes
    },
    storageLimit: {
      type: Number,
      default: 15 * 1024 * 1024 * 1024, // 15GB default
    },
  },
  { timestamps: true }
);

// Instance method to check storage availability
UserProfileSchema.methods.hasStorageSpace = function (fileSize) {
  return this.storageUsed + fileSize <= this.storageLimit;
};

// Instance method to update storage used
UserProfileSchema.methods.updateStorage = async function (sizeChange) {
  this.storageUsed += sizeChange;
  await this.save();
};

module.exports = mongoose.model(constant.DB_MODEL_REF.USER, UserProfileSchema);
