
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
import { ObjectId } from "mongodb";
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
  getDatabase,
} from "./config/database.js";

let mongoServer: MongoMemoryServer;
let agent: ReturnType<typeof request.agent>;
let projectId: ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DATABASE = "teamflow_test";
  process.env.JWT_SECRET = "teamflow-test-secret-for-vitest-only";

  await connectDatabase();
});

beforeEach(async () => {
  // Create a fresh authenticated user for each test.
  agent = request.agent(app);

  const email = `task-test-${Date.now()}@example.com`;

  const registered = await agent.post("/api/auth/register").send({
    name: "Task Test User",
    email,
    password: "TestPassword123",
  });

  expect(registered.status).toBe(201);

  const login = await agent.post("/api/auth/login").send({
    email,
    password: "TestPassword123",
  });

  expect(login.status).toBe(200);

  // Create a project owned by the authenticated test user.
  const project = await agent.post("/api/projects").send({
    name: "Task Test Project",
    description: "Project for task integration tests",
    status: "active",
    priority: "medium",
  });

  expect(project.status).toBe(201);

  projectId = new ObjectId(project.body.data._id);
});

afterEach(async () => {
  await getDatabase().collection("tasks").deleteMany({});
  await getDatabase().collection("projects").deleteMany({});
  await getDatabase().collection("users").deleteMany({
    email: /^task-test-/,
  });
});

afterAll(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

describe("Task API integration", () => {
  it("creates a task and saves it to the database", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({
        title: "Build login page",
        description: "Implement the login interface",
        projectId: projectId.toHexString(),
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Build login page");
    expect(response.body.status).toBe("todo");
    expect(response.body.priority).toBe("medium");

    const savedTask = await getDatabase()
      .collection("tasks")
      .findOne({ title: "Build login page" });

    expect(savedTask).not.toBeNull();
    expect(savedTask?.projectId.toString()).toBe(projectId.toHexString());
  });

  it("rejects a task with a nonexistent project", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({
        title: "Invalid task",
        projectId: new ObjectId().toHexString(),
      });

    expect(response.status).toBe(400);
   expect(response.body.message).toBe(
  "Project or assigned team member not found or not accessible",
);
  });

  it("lists tasks", async () => {
    await agent.post("/api/tasks").send({
      title: "Saved task",
      description: "",
      projectId: projectId.toHexString(),
    });

    const response = await agent.get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Saved task");
  });

  it("gets a task by ID", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
        title: "Task to find",
        projectId: projectId.toHexString(),
      });

    const response = await agent.get(
      `/api/tasks/${created.body._id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Task to find");
  });

  it("updates a task", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
        title: "Task before update",
        projectId: projectId.toHexString(),
      });

    const response = await agent
      .patch(`/api/tasks/${created.body._id}`)
      .send({
        title: "Task after update",
        status: "completed",
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Task after update");
    expect(response.body.status).toBe("completed");
  });

  it("deletes a task", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
        title: "Task to delete",
        projectId: projectId.toHexString(),
      });

    const response = await agent.delete(
      `/api/tasks/${created.body._id}`,
    );

    expect(response.status).toBe(204);

    const savedTask = await getDatabase()
      .collection("tasks")
      .findOne({ _id: new ObjectId(created.body._id) });

    expect(savedTask).toBeNull();
  });
});
