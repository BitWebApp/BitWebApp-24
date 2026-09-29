import { ApiError } from "../utils/ApiError.js";

/**
 * Global Error Handler Middleware
 * Catches all errors and prevents server crashes
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Log error for debugging
  console.error("Error occurred:", {
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
  });

  // Send error response
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  };

  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 - Route Not Found
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

export { errorHandler, notFoundHandler };
