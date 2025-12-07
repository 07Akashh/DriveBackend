const auth = require("./auth"),
  errorHandler = require("./errorHandler"),
  authenticate = require('./authenticate'),
  basicAuth =  require('./basicAuth')

module.exports = {
  auth,
  errorHandler,
  authenticate,
  basicAuth
};
