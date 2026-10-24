
import { describe, expect, it } from "vitest";
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from "./team-member.validation.js";

describe("createTeamMemberSchema", () => {
  it("accepts valid team member data", () => {
    const result = createTeamMemberSchema.safeParse({
      name: "Alex Silva",
      email: "alex@example.com",
      role: "developer",
    });

    expect(result.success).toBe(true);
  });

  it("trims whitespace and applies the default role", () => {
    const result = createTeamMemberSchema.safeParse({
      name: "  Alex Silva  ",
      email: "  alex@example.com  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Alex Silva");
      expect(result.data.email).toBe("alex@example.com");
      expect(result.data.role).toBe("other");
    }
  });

  it("rejects an empty name", () => {
    const result = createTeamMemberSchema.safeParse({
      name: "   ",
      email: "alex@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createTeamMemberSchema.safeParse({
      name: "Alex Silva",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported role", () => {
    const result = createTeamMemberSchema.safeParse({
      name: "Alex Silva",
      email: "alex@example.com",
      role: "administrator",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = createTeamMemberSchema.safeParse({
      name: "Alex Silva",
      email: "alex@example.com",
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });
});

describe("updateTeamMemberSchema", () => {
  it("accepts a partial update", () => {
    const result = updateTeamMemberSchema.safeParse({
      role: "designer",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty update", () => {
    const result = updateTeamMemberSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email during an update", () => {
    const result = updateTeamMemberSchema.safeParse({
      email: "invalid-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown fields during an update", () => {
    const result = updateTeamMemberSchema.safeParse({
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });
});
