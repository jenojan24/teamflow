
import {
  afterAll,
  afterEach,
  beforeAll,
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
let projectId: ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DATABASE = "teamflow_test";

  await connectDatabase();

  projectId = new ObjectId();

  await getDatabase().collection("projects").insertOne({
    _id: projectId,
    name: "Task Test Project",
    description: "Project for task integration tests",
    status: "active",
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

afterEach(async () => {
  await getDatabase().collection("tasks").deleteMany({});
});

afterAll(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

describe("Task API integration", () => {
  it("creates a task and saves it to the database", async () => {
    const response = await request(app)
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
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Invalid task",
        projectId: new ObjectId().toHexString(),
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Project not found");
  });

  it("lists tasks", async () => {
    await getDatabase().collection("tasks").insertOne({
      title: "Saved task",
      description: "",
      projectId,
      status: "todo",
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Saved task");
  });

  it("gets a task by ID", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Task to find",
        projectId: projectId.toHexString(),
      });

    const response = await request(app).get(
      `/api/tasks/${created.body._id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Task to find");
  });

  it("updates a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Task before update",
        projectId: projectId.toHexString(),
      });

    const response = await request(app)
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
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Task to delete",
        projectId: projectId.toHexString(),
      });

    const response = await request(app).delete(
      `/api/tasks/${created.body._id}`,
    );

    expect(response.status).toBe(204);

    const savedTask = await getDatabase()
      .collection("tasks")
      .findOne({ _id: new ObjectId(created.body._id) });

    expect(savedTask).toBeNull();
  });
});
