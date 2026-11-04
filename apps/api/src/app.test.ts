
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
  getDatabase,
} from "./config/database.js";

let mongoServer: MongoMemoryServer;
let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DATABASE = "teamflow_test";
  process.env.JWT_SECRET = "teamflow-test-secret-for-vitest-only";

  await connectDatabase();
});

beforeEach(async () => {
  agent = request.agent(app);

  const email = `app-test-${Date.now()}@example.com`;

  const registered = await agent.post("/api/auth/register").send({
    name: "App Test User",
    email,
    password: "TestPassword123",
  });

  expect(registered.status).toBe(201);

  const login = await agent.post("/api/auth/login").send({
    email,
    password: "TestPassword123",
  });

  expect(login.status).toBe(200);
});

afterEach(async () => {
  await getDatabase().collection("users").deleteMany({
    email: /^app-test-/,
  });
});

afterAll(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

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
    const response = await agent
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
    const response = await agent
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
