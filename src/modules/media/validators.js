const Joi = require("joi");

// Upload validation
const uploadValidation = {
  body: Joi.object({
    socketId: Joi.string().optional(),
    provider: Joi.string().valid("s3", "cloudinary").default("s3"),
  }),
};

// Share with users validation
const shareWithUsersValidation = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    permission: Joi.string().valid("view", "download").default("download"),
    expiresAt: Joi.date().optional(),
  }),
};

// Generate share link validation
const generateShareLinkValidation = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    expiresAt: Joi.date().optional(),
    maxAccessCount: Joi.number().integer().min(1).optional(),
  }),
};

// Get file validation
const getFileValidation = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

// Delete file validation
const deleteFileValidation = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

// Revoke access validation
const revokeAccessValidation = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    userIdOrEmail: Joi.alternatives()
      .try(Joi.string().email(), Joi.string())
      .required(),
  }),
};

// List files validation
const listFilesValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    filename: Joi.string().optional(),
    mimeType: Joi.string().optional(),
  }),
};

module.exports = {
  uploadValidation,
  shareWithUsersValidation,
  generateShareLinkValidation,
  getFileValidation,
  deleteFileValidation,
  revokeAccessValidation,
  listFilesValidation,
};
