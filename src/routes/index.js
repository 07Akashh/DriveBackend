const middleware = require("../middleware");
const user = require("../modules/user/route");
const auth = require("../modules/auth/route");
const media = require("../modules/media/route");
const mediaStreamRouter = require("../modules/media/streamRoute");
const responseHandler = require("../responseHandler");
//========================== Export Module Start ==========================
const routesWithAuth = [
  { path: "/api/v1/user", route: user },
  { path: "/api/v1/auth", route: auth },
  { path: "/api/v1/media", route: media },
];

const routesWithoutAuth = [{ path: "/api/v1/proxy/media", route: mediaStreamRouter }];

//========================== Export Module Start ==========================
module.exports = function (app) {
  routesWithAuth.forEach(({ path, route }) => {
    app.use(path, middleware.basicAuth.basicAuthentication, route);
  });

  routesWithoutAuth.forEach(({ path, route }) => {
    app.use(path, route);
  });

  app.get("/", (req, res) => {
    res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Welcome</title>
          </head>
          <body>
              <h1>Welcome to Drive Backend</h1>
          </body>
          </html>
      `);
  });
  // if(config.isProd){
  //     app.use(middleware.crypt.decrypt(config))
  // }

  // Attach ErrorHandler to Handle All Errors
  app.use(responseHandler.defaultRoute);
  app.use(responseHandler.handleError);
};
//========================== Export Module End ============================
