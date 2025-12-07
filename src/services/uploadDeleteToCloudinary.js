"use strict";
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const config = require("../config").cfg;
const appUtils = require("../utils/appUtils");

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.CLOUDINARY_CLOUD_NAME,
  api_key: config.cloudinary.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary.CLOUDINARY_API_SECRET,
});

const __deleteTempFile = (filePath) => {
  fs.stat(filePath, (err, _stats) => {
    if (err) {
      appUtils.logError({
        moduleName: "uploadDeleteToCloudinary",
        methodName: "__deleteTempFile",
        err,
      });
    }
    fs.unlink(filePath, (_err) => {
      if (_err) {
        console.log(_err);
        appUtils.logError({
          moduleName: "uploadDeleteToCloudinary",
          methodName: "__deleteTempFile",
          err: _err,
        });
      }
      console.log("file deleted successfully");
    });
  });
};

const __uploadToCloudinary = async (file, fileKey) => {
  try {
    const options = {
      public_id: fileKey,
      resource_type: "auto",
      folder: "drive",
    };

    const result = await cloudinary.uploader.upload(file.path, options);

    console.log({
      message: "File uploaded successfully",
      filename: fileKey,
      url: result.secure_url,
    });
    return result;
  } catch (err) {
    appUtils.logError({
      moduleName: "uploadDeleteToCloudinary",
      methodName: "__uploadToCloudinary",
      err,
    });
    throw err;
  }
};

function uploadFile(file, fileKey) {
  return __uploadToCloudinary(file, fileKey)
    .then((data) => {
      __deleteTempFile(file.path);
      return data;
    })
    .catch(function (_err) {
      appUtils.logError({
        moduleName: "uploadDeleteToCloudinary",
        methodName: "uploadFile",
        err: _err,
      });
      __deleteTempFile(file.path);
      throw _err;
    });
}

function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId, (err, result) => {
    if (err) {
      appUtils.logError({
        moduleName: "uploadDeleteToCloudinary",
        methodName: "deleteFromCloudinary",
        err,
      });
      return false;
    } else {
      console.log("delete success: ", result, publicId);
      return true;
    }
  });
}

function createUploadStream(fileKey, mimeType, userId, onComplete) {
  const resourceType = appUtils.getResourceType(mimeType);
  const folder = appUtils.getFolderName(mimeType, userId);

  return cloudinary.uploader.upload_stream(
    {
      public_id: fileKey,
      folder: folder,
      resource_type: resourceType,
    },
    (error, result) => {
      if (onComplete) {
        onComplete(error, result);
      }
    }
  );
}

module.exports = {
  uploadFile,
  __deleteTempFile,
  deleteFromCloudinary,
  createUploadStream,
};
