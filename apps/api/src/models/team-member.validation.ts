
import { z } from "zod";

const teamMemberRoleSchema = z.enum([
  "developer",
  "designer",
  "project-manager",
  "tester",
  "other",
]);

export const createTeamMemberSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.string().trim().email("A valid email is required").max(254),
    role: teamMemberRoleSchema.default("other"),
  })
  .strict();

export const updateTeamMemberSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100).optional(),
    email: z.string().trim().email("A valid email is required").max(254).optional(),
    role: teamMemberRoleSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateTeamMemberInput = z.infer<
  typeof createTeamMemberSchema
>;

export type UpdateTeamMemberInput = z.infer<
  typeof updateTeamMemberSchema
>;
