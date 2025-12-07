const express = require("express");
const router = express.Router();
const mediaFacade = require("./facade");
const authMiddleware = require("../../middleware/authenticate");
const responseHandler = require("../../responseHandler");

router.get("/:id/stream", [authMiddleware.optionalUserAuthenticatioTkn("all")], async (req, res) => {
  const fileId = req.params.id;

  const referer = req.headers.referer || req.headers.origin || "";
  const allowedOrigins = [
    "http://localhost:3000",
    "https://localhost:3000",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const isValidOrigin = allowedOrigins.some((origin) =>
    referer.startsWith(origin)
  );

  if (!isValidOrigin) {
    return res.status(401).json({
      message:
        "Authentication required. Access this resource through the application.",
    });
  }

  try {
    const media = await mediaFacade.getSecureFileStream(fileId, req.user);

    if (!media || !media.fileUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    const https = require("https");
    const http = require("http");
    const url = new URL(media.fileUrl);
    const protocol = url.protocol === "https:" ? https : http;

    const proxyReq = protocol.get(media.fileUrl, (proxyRes) => {
      res.status(proxyRes.statusCode);

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Security-Policy", "frame-ancestors *");

      res.setHeader(
        "Content-Type",
        media.mimeType || "application/octet-stream"
      );
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.setHeader("X-Content-Type-Options", "nosniff");

      if (proxyRes.headers["content-length"]) {
        res.setHeader("Content-Length", proxyRes.headers["content-length"]);
      }

      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Stream proxy error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to stream file" });
      }
    });

    req.on("close", () => {
      proxyReq.destroy();
    });
  } catch (error) {
    console.error("Stream access error:", error);
    const status =
      error.code === "access_denied"
        ? 403
        : error.code === "file_not_found"
        ? 404
        : 500;
    return res
      .status(status)
      .json({ message: error.message || "Access denied" });
  }
});


router.get("/:id/download", [authMiddleware.optionalUserAuthenticatioTkn("all")], async (req, res) => {
  const fileId = req.params.id;

  try {
    const media = await mediaFacade.downloadFile(fileId, req.user);
    const https = require("https");
    https
      .get(media.fileUrl, (fileRes) => {
        res.setHeader(
          "Content-Type",
          media.mimeType || "application/octet-stream"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(media.originalName)}"`
        );
        if (media.size) res.setHeader("Content-Length", media.size);
        fileRes.pipe(res);
      })
      .on("error", (err) => {
        console.error("Download stream error:", err);
        responseHandler.sendError(res, { message: "Failed to download file" });
      });
  } catch (error) {
    return responseHandler.sendError(res, error);
  }
});

module.exports = router;
