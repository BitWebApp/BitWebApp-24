import rateLimit from "express-rate-limit";

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export { createRateLimiter };
