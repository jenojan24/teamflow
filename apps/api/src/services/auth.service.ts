
import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import type { User } from "../models/user.model.js";
import type {
  RegisterUserInput,
  LoginUserInput,
} from "../models/user.validation.js";
import jwt from "jsonwebtoken";

const USERS_COLLECTION = "users";

export async function registerUser(input: RegisterUserInput) {
  const database = getDatabase();

  // Normalize email before checking for existing users.
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await database
    .collection<User>(USERS_COLLECTION)
    .findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const now = new Date();

  const newUser: User = {
    name: input.name,
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  const result = await database
    .collection<User>(USERS_COLLECTION)
    .insertOne(newUser);

  const createdUser = {
    _id: result.insertedId,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  return createdUser;
}

export async function loginUser(input: LoginUserInput) {
  const database = getDatabase();

  // Use the same normalization during login.
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await database
    .collection<User>(USERS_COLLECTION)
    .findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing from environment");
  }

  const token = jwt.sign(
    { userId: user._id!.toString() },
    jwtSecret,
    {
      expiresIn: "1d",
      algorithm: "HS256",
    },
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
