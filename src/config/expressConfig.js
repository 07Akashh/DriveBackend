const express = require("express"),
  bodyParser = require("body-parser"), // parses information from POST
  methodOverride = require("method-override"), // used to manipulate POST
  helmet = require("helmet"),
  cookieParser = require("cookie-parser"),
  cors = require("cors"),
  swaggerUi = require("swagger-ui-express");
const auth = require("basic-auth");

module.exports = function (app, _env) {
  // parses application/json bodies
  app.use(bodyParser.json());
  // parses application/x-www-form-urlencoded bodies
  // use queryString lib to parse urlencoded bodies
  app.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );
  // Configure helmet with relaxed settings for iframe embedding
  app.use(
    helmet({
      frameguard: false, // Allow iframes for PDF preview
      contentSecurityPolicy: false, // Disable CSP to allow cross-origin framing
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors());
  app.use(cookieParser());
  app.use(
    methodOverride(function (request, _response) {
      if (
        request.body &&
        typeof request.body === "object" &&
        "_method" in request.body
      ) {
        // look in urlencoded POST bodies and delete it
        var method = request.body._method;
        delete request.body._method;
        return method;
      }
    })
  );
  /**
   * add swagger to our project
   */
  var options = {
    swaggerOptions: {
      validatorUrl: null,
    },
  };
  // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
  app.use("/images", express.static(app.locals.rootDir + "/public/images"));
  app.use("/uploads", express.static(app.locals.rootDir + "/uploads"));
  app.use("/pages", express.static(app.locals.rootDir + "/public/view"));
  /*
   * all api request
   */

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, authorization, accessToken"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, GET, PUT, DELETE, OPTIONS"
    );
    if (req.method == "OPTIONS") {
      res.status(200).end();
    } else {
      next();
    }
  });
};
