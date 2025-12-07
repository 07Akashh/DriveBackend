const { v4: uuidv4 } = require("uuid");
const uploadDeleteToCloudinary = require("../../services/uploadDeleteToCloudinary");
const mediaService = require("./service");
const userService = require("../user/service");
const appUtils = require("../../utils/appUtils");
const path = require("path");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Media upload socket connected:", socket.id);

    const activeUploads = new Map();

    socket.on("media:upload:start", async (data) => {
      console.log("Upload started:", data);
      const { filename, size, mimeType, userId } = data;

      try {
        const user = await userService.getOne({ _id: userId });
        if (!user) {
          socket.emit("media:upload:error", {
            filename,
            error: "User not found",
          });
          return;
        }

        if (user.storageUsed + size > user.storageLimit) {
          socket.emit("media:upload:error", {
            filename,
            error: "Insufficient storage space",
          });
          return;
        }


        const originalName = filename;
        const baseName = path.parse(originalName).name;

        const fileKey = `${Date.now()}-${uuidv4()}-${baseName}`;

        const onComplete = async (error, result) => {
          if (error) {
            console.error("Upload stream error:", error);
            socket.emit("media:upload:error", {
              filename,
              error: error.message || "Upload failed",
            });
          } else {
            console.log("Upload stream complete:", result);
            try {
              const mediaData = {
                filename: filename,
                originalName: filename,
                mimeType: mimeType || result.format,
                size: result.bytes,
                uploadProvider: "cloudinary",
                fileUrl: result.secure_url,
                fileKey: result.public_id,
                owner: {
                  userId: userId,
                  email: user.email,
                },
                uploadedAt: new Date(),
              };

              const media = await mediaService.saveMedia(mediaData);

              if (media.addAuditLog) {
                await media.addAuditLog("upload", user, {
                  fileSize: result.bytes,
                  mimeType: mimeType,
                  provider: "cloudinary",
                });
              }

              user.storageUsed += result.bytes;
              await user.save();

              socket.emit("media:upload:complete", {
                fileId: media._id,
                filename: media.originalName,
                fileUrl: media.fileUrl,
                size: media.size,
                mimeType: media.mimeType,
              });
            } catch (dbError) {
              console.error("Database save error:", dbError);
              socket.emit("media:upload:error", {
                filename,
                error: "Failed to save file metadata",
              });
            }
          }
          activeUploads.delete(socket.id);
        };

        const uploadStream = uploadDeleteToCloudinary.createUploadStream(
          fileKey,
          mimeType,
          userId,
          onComplete
        );

        // Add error handler to prevent unhandled error crashes
        uploadStream.on("error", (err) => {
          console.error("Upload stream error (handled):", err.message);
          // onComplete will be called by destroy() or the stream itself
        });

        activeUploads.set(socket.id, {
          stream: uploadStream,
          fileData: { filename, size, mimeType, userId, fileKey },
          uploadedSize: 0,
        });

        socket.emit("media:upload:acknowledged", {
          socketId: socket.id,
          fileKey,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Upload start error:", err);
        socket.emit("media:upload:error", {
          filename,
          error: "Internal server error during upload initialization",
        });
      }
    });

    socket.on("media:upload:chunk", (data) => {
      const upload = activeUploads.get(socket.id);
      if (upload) {
        const { stream } = upload;

        if (data.chunk) {
          try {
            // Convert ArrayBuffer to Buffer
            let buffer;
            if (data.chunk instanceof ArrayBuffer) {
              buffer = Buffer.from(data.chunk);
            } else if (Buffer.isBuffer(data.chunk)) {
              buffer = data.chunk;
            } else if (
              data.chunk.type === "Buffer" &&
              Array.isArray(data.chunk.data)
            ) {
              // Handle serialized Buffer
              buffer = Buffer.from(data.chunk.data);
            } else {
              buffer = Buffer.from(data.chunk);
            }

            if (buffer.length > 0) {
              stream.write(buffer);
              upload.uploadedSize += buffer.length;

              socket.emit("media:upload:chunk-received", {
                uploadedSize: upload.uploadedSize,
                chunkIndex: data.chunkIndex,
              });
            }
          } catch (err) {
            console.error("Error processing chunk:", err);
            socket.emit("media:upload:error", {
              filename: upload.fileData.filename,
              error: "Failed to process file chunk",
            });
          }
        }
      }
    });

    socket.on("media:upload:end", async () => {
      const upload = activeUploads.get(socket.id);
      if (upload) {
        const { stream } = upload;
        stream.end();
        // Remove from active uploads immediately to prevent disconnect handler from destroying it
        // while it's finalizing (though finalize is async, stream.end() signals intention)
        // Actually, better wait for completion callback to remove?
        // But onComplete removes it.
        // If we disconnect while finalizing, we probably shouldn't destroy?
        // 'end' is called, stream is finishing.
        // We can mark it as 'ending'.
        upload.isFinishing = true;
      }
    });

    socket.on("media:upload:progress", (data) => {
      socket.emit("media:upload:progress", data);
    });

    socket.on("disconnect", () => {
      console.log("Media upload socket disconnected:", socket.id);
      const upload = activeUploads.get(socket.id);
      if (upload && !upload.isFinishing) {
        // If user disconnects and we haven't started finishing, abort.
        console.log("Aborting active upload due to disconnect");
        if (upload.stream.destroy) {
          upload.stream.destroy(new Error("Client disconnected"));
        } else {
          upload.stream.end();
        }
        activeUploads.delete(socket.id);
      }
    });
  });

  const emitProgress = (socketId, event, data) => {
    if (socketId && io.sockets.sockets.get(socketId)) {
      io.to(socketId).emit(event, data);
    }
  };

  const emitUploadComplete = (socketId, fileData) => {
    emitProgress(socketId, "media:upload:complete", {
      fileId: fileData._id,
      filename: fileData.originalName,
      fileUrl: fileData.fileUrl,
      size: fileData.size,
      timestamp: new Date(),
    });
  };

  const emitUploadError = (socketId, error) => {
    emitProgress(socketId, "media:upload:error", {
      error: error.message || "Upload failed",
      timestamp: new Date(),
    });
  };

  const emitProcessingStatus = (socketId, status) => {
    emitProgress(socketId, "media:processing:status", {
      status,
      timestamp: new Date(),
    });
  };

  return {
    emitProgress,
    emitUploadComplete,
    emitUploadError,
    emitProcessingStatus,
  };
};
