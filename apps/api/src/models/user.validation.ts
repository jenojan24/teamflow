import { z } from "zod";

export const registerUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),

    password: z.string().min(8).max(72),
  })
  .strict();

export type RegisterUserInput = z.infer<
  typeof registerUserSchema
>;

export const loginUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),

    password: z.string().min(1).max(72),
  })
  .strict();

export type LoginUserInput = z.infer<typeof loginUserSchema>;