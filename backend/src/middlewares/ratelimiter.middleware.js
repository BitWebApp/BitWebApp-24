import rateLimit from "express-rate-limit";

export const createRateLimiter = ({ windowMs, max }) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.ip,
    standardHeaders: true,
    legacyHeaders: false,
  });
};
