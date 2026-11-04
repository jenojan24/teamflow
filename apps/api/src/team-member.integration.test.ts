
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
    name: "Team Member Test User",
    email: `team-test-${Date.now()}@example.com`,
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
  process.env.JWT_SECRET = "teamflow-test-secret-for-vitest-only";

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DATABASE = "teamflow_test";

  await connectDatabase();
});

afterEach(async () => {
  await getDatabase().collection("teamMembers").deleteMany({});
  await getDatabase().collection("users").deleteMany({
    email: /^team-test-/,
  });
});

afterAll(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

describe("Team Member API integration", () => {
  it("creates a team member and saves it to the test database", async () => {
    const response = await agent
      .post("/api/team-members")
      .send({
        name: "Alex Silva",
        email: "alex@example.com",
        role: "developer",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Alex Silva");
    expect(response.body.data.email).toBe("alex@example.com");
    expect(response.body.data.role).toBe("developer");

    const savedMember = await getDatabase()
      .collection("teamMembers")
      .findOne({ email: "alex@example.com" });

    expect(savedMember).not.toBeNull();
    expect(savedMember?.name).toBe("Alex Silva");
  });

it("returns team members saved in the test database", async () => {
  await agent.post("/api/team-members").send({
    name: "Jamie Lee",
    email: "jamie@example.com",
    role: "designer",
  });

  const response = await agent.get("/api/team-members");

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveLength(1);
  expect(response.body.data[0].name).toBe("Jamie Lee");
});

  it("gets a team member by ID", async () => {
    const created = await agent
      .post("/api/team-members")
      .send({
        name: "Taylor Smith",
        email: "taylor@example.com",
        role: "tester",
      });

    const id = created.body.data._id;

    const response = await agent.get(`/api/team-members/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Taylor Smith");
  });

  it("updates a team member", async () => {
    const created = await agent
      .post("/api/team-members")
      .send({
        name: "Morgan Green",
        email: "morgan@example.com",
        role: "developer",
      });

    const id = created.body.data._id;

    const response = await agent
      .patch(`/api/team-members/${id}`)
      .send({
        name: "Morgan Brown",
        role: "project-manager",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Morgan Brown");
    expect(response.body.data.role).toBe("project-manager");
    expect(response.body.data.email).toBe("morgan@example.com");
  });

  it("deletes a team member", async () => {
    const created = await agent
      .post("/api/team-members")
      .send({
        name: "Jordan White",
        email: "jordan@example.com",
        role: "other",
      });

    const id = created.body.data._id;

    const deleted = await agent.delete(`/api/team-members/${id}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Team member deleted successfully");

    const fetched = await agent.get(`/api/team-members/${id}`);

    expect(fetched.status).toBe(404);
    expect(fetched.body.message).toBe("Team member not found");
  });
});
