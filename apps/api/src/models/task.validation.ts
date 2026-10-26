
import { z } from "zod";

const taskStatusSchema = z.enum([
  "todo",
  "in-progress",
  "completed",
]);

const taskPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
]);

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(150),
    description: z.string().trim().max(2000).default(""),
    projectId: z.string().trim().min(1, "Project ID is required"),
    assignedTo: z.string().trim().min(1).optional(),
    status: taskStatusSchema.default("todo"),
    priority: taskPrioritySchema.default("medium"),
    dueDate: z.iso.datetime().optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    projectId: z.string().trim().min(1).optional(),
    assignedTo: z.string().trim().min(1).nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.iso.datetime().nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
