import type { Request, Response, NextFunction } from "express";

const allowedOrigins = (
  process.env.CLIENT_URL ??
  "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;

  // Browser requests that modify data must have an allowed origin.
  if (!origin) {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Request origin is required",
      });
    }

    return next();
  }

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  next();
}