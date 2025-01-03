import rateLimit from "express-rate-limit";
import requestIp from "request-ip";

export const requestIpMiddleware = requestIp.mw();

export const createRateLimiter = ({ windowMs, max }) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.clientIp,
    standardHeaders: true,
    legacyHeaders: false,
  });
};
