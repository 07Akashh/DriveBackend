const customException = require("./customException"),
  logger = require("./logger").logger,
  APIResponse = require("./model/APIResponse"),
  middleware = require("./middleware"),
  config = require("./config").cfg,
  Sentry = require("@sentry/node"),
  SentryTracing = require("@sentry/tracing");
Sentry.init({
  dsn: config.sentryDsn,
  environment: config.environment,
  tracesSampleRate: 1.0,
  release: `${config.msName}@${process.env.npm_package_version}`,
});

function _sendResponse(response, result, status = 200) {
  if (config.config) {
    result = middleware.crypt.encrypt(result, config);
  }
  console.log(result);
  return response.status(status).send(result);
}
function sendError(response, error) {
  if (error instanceof Error) {
    Sentry.captureException(error);
  }
  let statusCode = error.status || 500;
  if (!error?.err?.errCode) {
    if (!error.errCode) {
      error = customException.intrnlSrvrErr(error);
    }
  } else {
    error = error?.err;
  }
  var result = new APIResponse(statusCode, error);
  delete result.err.status;
  _sendResponse(response, result, statusCode);
}
function handleError(error, request, response, next) {
  sendError(response, error);
}
const defaultRoute = (req, res) => {
  res.send(
    "<html><head></head><body><h1> 404 Sorry, an error has occured, Requested page not found!</p></h1></body></html>"
  );
};

function sendSuccess(response, result) {
  var outResult = new APIResponse(200, result);
  _sendResponse(response, outResult);
}
// ========================== Export Module Start ==========================
module.exports = {
  sendError,
  handleError,
  sendSuccess,
  defaultRoute,
};
// ========================== Export Module End =======================
