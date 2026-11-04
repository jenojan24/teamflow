import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { User } from "../models/user.model.js";

interface AuthTokenPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing from environment");
    }

   const decoded = jwt.verify(token, jwtSecret, {
  algorithms: ["HS256"],
});

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      !ObjectId.isValid(decoded.userId)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const database = getDatabase();

    const user = await database
      .collection<User>("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account not found",
      });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
      return;
    }

    next(error);
  }
}