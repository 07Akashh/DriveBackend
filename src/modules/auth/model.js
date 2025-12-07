const mongoose = require("mongoose")

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  uid: {
    type: String,
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    platform: String,
    browser: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
})

SessionSchema.methods.deactivate = function () {
  return new Promise((resolve, reject) => {
    this.isActive = false
    this.save()
      .then((result) => resolve(result))
      .catch((error) => reject(error))
  })
}

module.exports = mongoose.model("Session", SessionSchema);