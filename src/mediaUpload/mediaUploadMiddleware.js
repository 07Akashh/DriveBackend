var customExc = require("./../customException");

var { isObjEmp } = require("../utils/appUtils");

var uploadDeleteToCloudinary = require("../services/uploadDeleteToCloudinary");

function getfileKey(chk, name, userId) {
  let fileKey;
  switch (chk) {
    case "org_img":
      fileKey = "org_img/";
      break;
    case "subadmin":
      fileKey = "subadmin/";
      break;
    case "country":
      fileKey = "country/";
      break;
    case "university":
      fileKey = "university/";
      break;
    case "course":
      fileKey = "course/";
      break;
    case "flagimg":
      fileKey = "flagimg/";
      break;
    case "globalElem":
      fileKey = "globalElem/";
      break;
    case "admn_img":
      fileKey = "admn_img/";
      break;
    case "contentAudio":
      fileKey = "contentAudio/";
      break;
    case "video":
      fileKey = "video/";
      break;
    case "contentImage":
      fileKey = "contentImage/";
      break;
    case "thumbnail":
      fileKey = "thumbnail/";
      break;
    default:
      fileKey = "media/";
      break;
  }
  return userId ? `${userId}/${fileKey}${name}` : `${fileKey}${name}`;
}

module.exports = {
  uploadSingleMediaToCloudinary: function cloudinarySingleFileUpload(
    chk,
    multikey = false
  ) {
    return function (req, _res, next) {
      var file = req.files || req.file;
      if (!file) {
        return next();
      }
      if (isObjEmp(file)) {
        return next();
      }
      if (multikey) {
        if (file[chk]) file = file[chk][0];
        else return next();
      }
      let filechk = chk;
      const userId = req.user ? req.user._id || req.user.user_id : null;
      let fileKey = getfileKey(filechk, file.filename, userId);
      return new Promise(function (_resolve, _reject) {
        return uploadDeleteToCloudinary
          .uploadFile(file, fileKey)
          .then(function (_url) {
            file.cloudinary = _url;
            return next();
          })
          .catch(function (err) {
            return next(
              customExc.completeCustomException("intrnlSrvrErr", err)
            );
          });
      });
    };
  },

  FileMultiUploadToCloudinary: (keys) => {
    return function (req, _res, next) {
      var files = req.files || req.file;
      if (!files || isObjEmp(files)) {
        return next();
      }
      return Promise.all(
        keys.flatMap((key) => {
          let keyFile = files[key];
          if (keyFile) {
            return keyFile.map((file) => {
              const userId = req.user ? req.user._id || req.user.user_id : null;
              let fileKey = getfileKey(key, file.filename, userId);
              return uploadDeleteToCloudinary
                .uploadFile(file, fileKey, key)
                .then((result) => {
                  file.cloudinary = result;
                  return result;
                });
            });
          }
          return []; // Return an empty array if no files for this key
        })
      )
        .then(function (_url) {
          return next();
        })
        .catch(function (err) {
          return next(customExc.completeCustomException("intrnlSrvrErr", err));
        });
    };
  },
};
