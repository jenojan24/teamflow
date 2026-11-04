
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
let agent = request.agent(app);

beforeEach(async () => {
  agent = request.agent(app);

  const credentials = {
    name: "Project Test User",
    email: `project-test-${Date.now()}@example.com`,
    password: "TestPassword123",
  };

  const registration = await agent
    .post("/api/auth/register")
    .send(credentials);

  expect(registration.status).toBe(201);

  const login = await agent
    .post("/api/auth/login")
    .send({
      email: credentials.email,
      password: credentials.password,
    });

  expect(login.status).toBe(200);
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DATABASE = "teamflow_test";
  process.env.JWT_SECRET = "teamflow-test-secret-for-vitest-only";

  await connectDatabase();
});

afterEach(async () => {
  await getDatabase().collection("projects").deleteMany({});
  await getDatabase().collection("users").deleteMany({
    email: /^project-test-/,
  });
});
afterAll(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

describe("Project API integration", () => {
  it("creates a project and saves it to the test database", async () => {
    const response = await agent
      .post("/api/projects")
      .send({
        name: "Integration Test Project",
        description: "Testing MongoDB integration",
        status: "planning",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Integration Test Project");

    const savedProject = await getDatabase()
      .collection("projects")
      .findOne({ name: "Integration Test Project" });

    expect(savedProject).not.toBeNull();
    expect(savedProject?.status).toBe("planning");
  });

it("returns projects saved in the test database", async () => {
  await agent.post("/api/projects").send({
    name: "Saved Test Project",
    description: "A project created for testing",
    status: "active",
  });

  const response = await agent.get("/api/projects");

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveLength(1);
  expect(response.body.data[0].name).toBe("Saved Test Project");
});

  
  it("gets a project by ID", async () => {
    const created = await agent
      .post("/api/projects")
      .send({
        name: "Project To Find",
        status: "planning",
      });

    const id = created.body.data._id;

    const response = await agent.get(`/api/projects/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Project To Find");
  });

  it("updates a project", async () => {
    const created = await agent
      .post("/api/projects")
      .send({
        name: "Project Before Update",
        status: "planning",
      });

    const id = created.body.data._id;

    const response = await agent
      .patch(`/api/projects/${id}`)
      .send({
        name: "Project After Update",
        status: "active",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Project After Update");
    expect(response.body.data.status).toBe("active");
  });

  it("deletes a project", async () => {
    const created = await agent
      .post("/api/projects")
      .send({
        name: "Project To Delete",
        status: "planning",
      });

    const id = created.body.data._id;

    const deleted = await agent.delete(`/api/projects/${id}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Project deleted successfully");

    const fetched = await agent.get(`/api/projects/${id}`);

    expect(fetched.status).toBe(404);
    expect(fetched.body.message).toBe("Project not found");
  });

});
