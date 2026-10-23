import { z } from "zod";

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000).default(""),
    status: z
      .enum(["planning", "active", "completed"])
      .default("planning"),
    priority: z
      .enum(["low", "medium", "high"])
      .default("medium"),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.enum(["planning", "active", "completed"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;