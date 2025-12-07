const mediaDao = require("./model");
const baseDao = require("../../baseDao");
const { pagination } = require("../../utils/appUtils");
const appUtils = require("../../utils/appUtils");

const saveMedia = (info) => {
  const newMedia = new mediaDao(info);
  return newMedia.save();
};

const MediaList = (info, all = false) => {
  let query = _queryFilter(info),
    project = {},
    paginate = {};

  if (!all) {
    paginate = pagination(info);
  }
  return baseDao(mediaDao).getMany(query, project, paginate);
};

const _queryFilter = (info) => {
  let filter = {};

  if (info.filename) filter.filename = appUtils.regexIncase(info.filename);
  if (info.originalName)
    filter.originalName = appUtils.regexIncase(info.originalName);
  if (info.mimeType) filter.mimeType = info.mimeType;
  if (info.owner) filter["owner.userId"] = info.owner;
  if (info["owner.userId"]) filter["owner.userId"] = info["owner.userId"];
  if (info["owner.email"]) filter["owner.email"] = info["owner.email"];
  if (info["sharedWith.email"])
    filter["sharedWith.email"] = info["sharedWith.email"];
  if (info.uploadProvider) filter.uploadProvider = info.uploadProvider;
  if (info.isPublic !== undefined) filter.isPublic = info.isPublic;
  if (info.status !== undefined) filter.status = info.status;
  if (info.isDeleted !== undefined) filter.isDeleted = info.isDeleted;

  return filter;
};

module.exports = {
  ...baseDao(mediaDao),
  saveMedia,
  MediaList,
};
