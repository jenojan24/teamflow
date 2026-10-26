
import { describe, expect, it } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
} from "./task.validation.js";

describe("createTaskSchema", () => {
  it("accepts valid task data", () => {
    const result = createTaskSchema.safeParse({
      title: "Build login page",
      projectId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.status).toBe("todo");
      expect(result.data.priority).toBe("medium");
      expect(result.data.description).toBe("");
    }
  });

  it("rejects an empty title", () => {
    expect(
      createTaskSchema.safeParse({
        title: "   ",
        projectId: "507f1f77bcf86cd799439011",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid status", () => {
    expect(
      createTaskSchema.safeParse({
        title: "Build login page",
        projectId: "507f1f77bcf86cd799439011",
        status: "started",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(
      createTaskSchema.safeParse({
        title: "Build login page",
        projectId: "507f1f77bcf86cd799439011",
        unexpected: true,
      }).success,
    ).toBe(false);
  });

  it("accepts a valid ISO datetime for the due date", () => {
    expect(
      createTaskSchema.safeParse({
        title: "Build login page",
        projectId: "507f1f77bcf86cd799439011",
        dueDate: "2026-12-01T12:00:00.000Z",
      }).success,
    ).toBe(true);
  });
});

describe("updateTaskSchema", () => {
  it("accepts a partial update", () => {
    expect(
      updateTaskSchema.safeParse({ status: "completed" }).success,
    ).toBe(true);
  });

  it("allows removing an assignee and due date", () => {
    expect(
      updateTaskSchema.safeParse({
        assignedTo: null,
        dueDate: null,
      }).success,
    ).toBe(true);
  });

  it("rejects an empty update", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    expect(
      updateTaskSchema.safeParse({ priority: "urgent" }).success,
    ).toBe(false);
  });
});

