const userDao = require('./model')
const baseDao = require("../../baseDao");
const { pagination,regexIncase } = require('../../utils/appUtils');
const appUtils = require('../../utils/appUtils');
//========================== Load Modules End =========================

/**
 * Save a new syllabus
 * @param {Object} info - Syllabus details
 */
const saveUser = (info) => {
    const newUser = new userDao(info);
    return newUser.save();
};

/**
 * Get a list of syllabus with optional filtering and pagination
 * @param {Object} info - Filter and pagination data
 * @param {Boolean} all - Flag to determine if pagination is required
 */
const UserList = (info, all = false) => {
    let query = _queryFilter(info),
        project = {},
        paginate = {};

    if (!all) {
        paginate = pagination(info);
    }
    return baseDao(userDao).getMany(query, project, paginate);
};

/**
 * Helper function to build the query filter for searching syllabuses
 * @param {Object} info - Filter criteria
 * @returns {Object} - Query filter object
 */
const _queryFilter = (info) => {
    let filter = {isDeleted: false };
    if (info.name) filter.name = appUtils.regexIncase(info.name);
    if (info.email) filter.email = appUtils.regexIncase(info.email);
    if (info.phone) filter.phone = info.phone;
    if (info.status !== undefined) filter.status = info.status;
    return filter;
};

//========================== Export Module Start =======================
module.exports = {
    ...baseDao(userDao),
    saveUser,
    UserList
};
//========================== Export Module End =========================