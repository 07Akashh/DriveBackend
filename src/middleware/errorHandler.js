const errorHandler = (error, req, res, next) => {
  console.error("Error:", error)

  // Default error
  let statusCode = 500
  let message = "Internal Server Error"

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400
    message = Object.values(error.errors)
      .map((err) => err.message)
      .join(", ")
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400
    const field = Object.keys(error.keyValue)[0]
    message = `${field} already exists`
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  }

  // Firebase auth errors
  if (error.code && error.code.startsWith("auth/")) {
    statusCode = 401
    message = error.message
  }

  // Custom API errors
  if (error.statusCode) {
    statusCode = error.statusCode
    message = error.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
}

module.exports = errorHandler
