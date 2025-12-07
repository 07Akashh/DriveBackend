"use strict";

//========================== Load Modules Start ===========================

//========================== Load External Module =========================

var sha256 = require("sha256");
var bcrypt = require("bcryptjs");
var randomstring = require("randomstring");
const moment = require("moment");
const { Types } = require("mongoose");
//========================== Load Modules End =============================

//========================== Export Module Start ===========================

/**
 * return user home
 * @returns {*}
 */
function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getNodeEnv() {
  return process.env.NODE_ENV;
}

/**
 * returns if email is valid or not
 * @returns {boolean}
 */
function isValidEmail(email) {
  var pattern = /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/;
  return new RegExp(pattern).test(email);
}

/**
 * returns  password hash
 * @returns {string}
 */
function genrateOnlyHash(pass) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pass, salt);
}

/**
 * returns  check with hash
 * @returns {boolean}
 */
function checkWithHash(pass, hash) {
  return bcrypt.compareSync(pass, hash);
}

/**
 * returns if zipCode is valid or not (for US only)
 * @returns {boolean}
 */
function isValidPhoneNumber(num) {
  if (Number.isInteger(num)) {
    num = num.toString();
  }
  if (phoneNumber.indexOf("+") > -1) return new RegExp(pattern).test(zipcode);
}
/**
 * returns if zipCode is valid or not (for US only)
 * @returns {boolean}
 */
function isValidZipCode(zipcode) {
  var pattern = /^\d{5}(-\d{4})?$/;
  return new RegExp(pattern).test(zipcode);
}
/**
 * returns if zipCode is valid or not (for US only)
 * @returns {boolean}
 */
function createHashSHA256(pass) {
  return sha256(pass);
}

const setCookie = (res, key, value) => {
  res.cookie(key, value.acesssToken);
  delete value.acesssToken;
};

/**
 * returns random number for password
 * @returns {string}
 */
var getRandomPassword = function () {
  return getSHA256(Math.floor(Math.random() * 1000000000000 + 1));
};

var getSHA256 = function (val) {
  return sha256(val + "password");
};

var encryptHashPassword = function (password, salt) {
  return bcrypt.hashSync(password, salt);
};

const pagination = (info, defaultLimit = 10) => {
  if (info.all) return {};
  else {
    let limit = defaultLimit,
      skip = 0;
    if (info.limit && !isNaN(info.limit)) limit = Number(info.limit);
    if (info.page && !isNaN(info.page)) skip = Number(limit * info.page);
    return { limit, skip };
  }
};

var generateSaltAndHashForPassword = function (password) {
  var encryptPassword = {
    salt: "",
    hash: "",
  };
  encryptPassword["salt"] = bcrypt.genSaltSync(10);
  encryptPassword["hash"] = bcrypt.hashSync(password, encryptPassword["salt"]);
  return encryptPassword;
};

/**
 *
 * @param string
 * @returns {boolean}
 */
var stringToBoolean = function (string) {
  switch (string.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(string);
  }
};
/**
 *
 * @returns {string}
 * get random 6 digit number
 * FIX ME: remove hard codeing
 * @private
 */
function getRandomOtp(length = 6, charset = "numeric") {
  //Generate Random Number
  return randomstring.generate({
    charset,
    length,
  });
}

function isValidPhone(phone, verifyCountryCode) {
  var reExp = verifyCountryCode ? /^\+\d{6,16}$/ : /^\d{6,16}$/;
  return reExp.test(phone);
}

function createRedisValueObject(user) {
  var respObj = {};
  respObj.userId = user._id;
  return respObj;
}
const genOtp = () => Math.floor(1000 + Math.random() * 9000);

const isObjEmp = (obj) => {
  return Object.keys(obj).length > 0 ? false : true;
};

const genRandStr = (digit) => {
  let num = Number(digit);
  if (num) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < num; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } else {
    return "";
  }
};

const base64En = (str) => {
  return Buffer.from(str).toString("base64");
};

const base64De = (Enstr) => {
  return Buffer.from(Enstr, "base64").toString("ascii");
};

const withinDay = (date) => {
  let tommorow = moment(),
    today = moment(date),
    hours = tommorow.diff(today, "hours");
  return hours < 24 ? true : false;
};

const regexIncase = (val) => {
  let reg = new RegExp(`${val}`);
  let regObj = {
    $regex: reg,
    $options: "i",
  };
  return regObj;
};

const regexIncaseStrict = (val) => {
  let reg = new RegExp(`^${val}$`);
  let regObj = {
    $regex: reg,
    $options: "i",
  };
  return regObj;
};

const sorting = (list, info) => {
  if (info.sort_val && info.dir) {
    let key = info.sort_val;
    list.sort({ [key]: info.dir });
    return list;
  }
  return list.sort({ _id: -1 });
};
const getUserType = (info) => {
  let user;
  switch (info.type) {
    case "staff":
      user = "staff";
      break;
    case "org":
      user = "org";
      break;
    default:
      user = "admin";
  }
  return user;
};

const filterValidObjectData = (obj) => {
  return Object.keys(obj).reduce((filtered, key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      filtered[key] = obj[key];
    }
    return filtered;
  }, {});
};

const convertToObjectId = (id) => {
  return Types.ObjectId(id);
};

const logError = (info) => {
  console.error(
    `Error inside ${info?.moduleName} module, ${info?.methodName} method err: `,
    info?.err || info?.error
  );
};

const regexExactMatchCaseInsensitive = (val, exact = true) => {
  let pattern = exact ? `^${val}$` : `${val}`;
  let reg = new RegExp(pattern, "i");
  return { $regex: reg };
};

const calculateSubscriptionExpiryDate = (info) => {
  let date = new Date(),
    subscriptionExpiryDate = new Date(date);
  if (info?.unit === "months") {
    subscriptionExpiryDate.setMonth(
      subscriptionExpiryDate.getMonth() + info?.duration
    );
  } else if (info?.unit === "days") {
    subscriptionExpiryDate.setDate(
      subscriptionExpiryDate.getDate() + info?.duration
    );
  }
  return subscriptionExpiryDate;
};

const getPricePerUnitFieldName = (unit) => {
  const singularUnit = unit.endsWith("s") ? unit.slice(0, -1) : unit;

  if (!singularUnit) return null;

  const capitalizedUnit =
    singularUnit.charAt(0).toUpperCase() + singularUnit.slice(1).toLowerCase();

  return `PricePer${capitalizedUnit}`;
};

const parseEnvValue = (value) => {
  if (value === undefined) return undefined;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  if (!isNaN(value) && value.trim() !== "") return Number(value);
  return value;
};

function sanitizeUser(user) {
  if (!user) return null;

  if (typeof user.toObject === "function") {
    user = user.toObject();
  }

  const { password, __v, ...rest } = user;
  return rest;
}

function getResourceType(mimeType) {
  if (!mimeType) return "raw";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
}

function getFolderName(mimeType, userId) {
  if (!mimeType) return `drive/${userId}/files`;
  if (mimeType.startsWith("image/")) return `drive/${userId}/images`;
  if (mimeType.startsWith("video/")) return `drive/${userId}/videos`;
  if (mimeType.startsWith("audio/")) return `drive/${userId}/audios`;
  return `drive/${userId}/files`;
}

//========================== Export Module Start ===========================

module.exports = {
  appHttpClient: "",
  getUserHome,
  getNodeEnv,
  isValidEmail,
  isValidZipCode,
  isValidPhoneNumber,
  createHashSHA256,
  getRandomPassword,
  encryptHashPassword,
  generateSaltAndHashForPassword,
  stringToBoolean,
  getRandomOtp,
  isValidPhone,
  createRedisValueObject,
  isObjEmp,
  genOtp,
  genRandStr,
  base64En,
  base64De,
  withinDay,
  regexIncase,
  pagination,
  sorting,
  getUserType,
  genrateOnlyHash,
  checkWithHash,
  setCookie,
  regexIncaseStrict,
  filterValidObjectData,
  convertToObjectId,
  logError,
  regexExactMatchCaseInsensitive,
  calculateSubscriptionExpiryDate,
  getPricePerUnitFieldName,
  parseEnvValue,
  sanitizeUser,
  getFolderName,
  getResourceType,
};

//========================== Export Module End===========================
