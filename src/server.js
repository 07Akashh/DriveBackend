console.log("");
console.log(
  "//************************* Nodejs App **************************//"
);
console.log("");
//.env file
require("dotenv").config();

const config = require("./config");
const { initializeFirebase } = require("./config/firebase");
const mongoose = require("mongoose");

// Global flag to track if application has started
global.appStarted = false;

// Initialize Express app (reusable for both serverless and traditional server)
let app = null;
let io = null;

function initializeApp() {
  if (app) {
    return { app, io };
  }

  // load external modules
  const express = require("express");
  var responseTime = require("response-time");

  // init express app
  app = express();
  app.use(responseTime());
  //   app.use(compression());
  // set the view engine to ejs
  // Increase payload limit for URL-encoded bodies
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(express.json({ limit: "50mb" }));
  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");

  // set server home directory
  app.locals.rootDir = __dirname;
  global.approot = __dirname;

  // config express
  config.expressConfig(app, config.cfg);

  // attach the routes to the app
  require("./routes")(app);

  // Initialize Firebase
  initializeFirebase();

  return { app, io };
}

// Serverless handler for Vercel
const handler = async (req, res) => {
  try {
    // Ensure database connection before handling request (optimized for serverless)
    if (mongoose.connection.readyState === 0) {
      // Not connected, connect now
      await new Promise((resolve, reject) => {
        config.dbConfig(config.cfg, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    const { app } = initializeApp();
    app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Traditional server startup (for local development)
if (require.main === module) {
  config.dbConfig(config.cfg, (error) => {
    if (error) {
      console.log(error, "Exiting the app.");
      return;
    }

    // Check if application has already started
    if (global.appStarted) {
      console.log(
        "Application has already started. Skipping server initialization."
      );
      return;
    }

    const { app: expressApp } = initializeApp();

    // load modules needed for traditional server
    const http = require("http");
    const { Server } = require("socket.io");

    // Create an HTTP server instance
    const server = http.createServer(expressApp);

    // Initialize Socket.IO
    io = new Server(server, {
      cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
      },
    });

    // Make io accessible to routes
    expressApp.set("io", io);

    // Setup Media Socket Handler
    const mediaSocketHandler = require("./modules/media/mediaSocket");
    mediaSocketHandler(io);

    // Setup WebSocket handling
    io.on("connection", (socket) => {
      console.log("A client connected:", socket.id);
      const userId = socket.handshake.query.userId;
      console.log("User id: ", userId);

      if (userId) {
        socket.join(userId);
        console.log(`Client ${socket.id} joined room ${userId}`);
      }

      socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
        if (userId) {
          socket.leave(userId);
          console.log(`Client ${socket.id} left room ${userId}`);
        }
      });
    });

    // start server with error handling
    server
      .listen(config.cfg.port, () => {
        global.appStarted = true;
        console.log(
          `Express server listening on ${config.cfg.port}, in ${config.cfg.environment} mode`
        );
      })
      .on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          console.log(
            `Port ${config.cfg.port} is already in use. Application may already be running.`
          );
          console.log(
            "If you want to start a new instance, please stop the existing one first."
          );
        } else {
          console.log("Server error:", error);
        }
      });
  });
}

// Export handler for serverless (Vercel)
module.exports = handler;
