
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "./app.js";

describe("GET /api/health", () => {
  it("returns the API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "TeamFlow API is running",
    });
  });
});

describe("Unknown routes", () => {
  it("returns 404 for a route that does not exist", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });
});


describe("POST /api/projects validation", () => {
  it("rejects a project with an empty name", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({
        name: "   ",
        description: "Invalid project",
        status: "planning",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid project data");
  });

  it("rejects an unsupported project status", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({
        name: "TeamFlow",
        status: "cancelled",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid project data");
  });
});
