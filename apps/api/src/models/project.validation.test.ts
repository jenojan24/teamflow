
import { describe, expect, it } from "vitest";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation.js";

describe("createProjectSchema", () => {
  it("accepts valid project data", () => {
    const result = createProjectSchema.safeParse({
      name: "TeamFlow",
      description: "Project management application",
      status: "planning",
    });

    expect(result.success).toBe(true);
  });

  it("trims whitespace and applies default values", () => {
    const result = createProjectSchema.safeParse({
      name: "  TeamFlow  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("TeamFlow");
      expect(result.data.description).toBe("");
      expect(result.data.status).toBe("planning");
      expect(result.data.priority).toBe("medium");
    }
  });

  it("rejects an empty project name", () => {
    const result = createProjectSchema.safeParse({
      name: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported status", () => {
    const result = createProjectSchema.safeParse({
      name: "TeamFlow",
      status: "cancelled",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = createProjectSchema.safeParse({
      name: "TeamFlow",
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid project priority", () => {
  const result = createProjectSchema.safeParse({
    name: "TeamFlow",
    priority: "high",
  });

  expect(result.success).toBe(true);
});

it("rejects an unsupported priority", () => {
  const result = createProjectSchema.safeParse({
    name: "TeamFlow",
    priority: "urgent",
  });

  expect(result.success).toBe(false);
});

});

describe("updateProjectSchema", () => {
  it("accepts a partial update", () => {
    const result = updateProjectSchema.safeParse({
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty update", () => {
    const result = updateProjectSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("accepts a priority update", () => {
  const result = updateProjectSchema.safeParse({
    priority: "low",
  });

  expect(result.success).toBe(true);
});


});
