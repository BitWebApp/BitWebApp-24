import rateLimit from "express-rate-limit";

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || "Too many requests, please try again later.",
    headers: options.headers !== undefined ? options.headers : true,
  });
};

export { createRateLimiter };
