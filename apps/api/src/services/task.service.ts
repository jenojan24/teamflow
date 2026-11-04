import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { Task } from "../models/task.model.js";
import type { Project } from "../models/project.model.js";
import type { TeamMember } from "../models/team-member.model.js";

function getTasksCollection(): Collection<Task> {
  return getDatabase().collection<Task>("tasks");
}

function getProjectsCollection(): Collection<Project> {
  return getDatabase().collection<Project>("projects");
}

function getTeamMembersCollection(): Collection<TeamMember> {
  return getDatabase().collection<TeamMember>("teamMembers");
}

// Create task
export async function createTask(
  data: Omit<Task, "_id" | "createdAt" | "updatedAt">,
  ownerId: string,
): Promise<Task | null> {
  const ownerObjectId = new ObjectId(ownerId);

  const project = await getProjectsCollection().findOne({
    _id: data.projectId,
    ownerId: ownerObjectId,
  });

  if (!project) {
    return null;
  }

  if (data.assignedTo) {
    const member = await getTeamMembersCollection().findOne({
      _id: data.assignedTo,
      ownerId: ownerObjectId,
    });

    if (!member) {
      return null;
    }
  }

  const now = new Date();

  const task: Task = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getTasksCollection().insertOne(task);

  return {
    ...task,
    _id: result.insertedId,
  };
}

// Get all tasks belonging to user's projects
export async function getTasks(ownerId: string): Promise<Task[]> {
  const projects = await getProjectsCollection()
    .find({ ownerId: new ObjectId(ownerId) })
    .project<{ _id: ObjectId }>({ _id: 1 })
    .toArray();

  const projectIds = projects.map((project) => project._id);

  return getTasksCollection()
    .find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .toArray();
}

// Get one task
export async function getTaskById(
  id: string,
  ownerId: string,
): Promise<Task | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const projects = await getProjectsCollection().find({
    ownerId: new ObjectId(ownerId),
  }).project<{ _id: ObjectId }>({ _id: 1 }).toArray();

  const projectIds = projects.map((project) => project._id);

  return getTasksCollection().findOne({
    _id: new ObjectId(id),
    projectId: { $in: projectIds },
  });
}

// Update task
export async function updateTask(
  id: string,
  ownerId: string,
  data: Partial<
    Pick<
      Task,
      | "title"
      | "description"
      | "projectId"
      | "assignedTo"
      | "status"
      | "priority"
      | "dueDate"
    >
  >,
): Promise<Task | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const ownerObjectId = new ObjectId(ownerId);
  const taskId = new ObjectId(id);

  // Find the existing task only if it belongs to this user.
  const ownedProjects = await getProjectsCollection()
    .find({ ownerId: ownerObjectId })
    .project<{ _id: ObjectId }>({ _id: 1 })
    .toArray();

  const projectIds = ownedProjects.map((project) => project._id);

  const existingTask = await getTasksCollection().findOne({
    _id: taskId,
    projectId: { $in: projectIds },
  });

  if (!existingTask) {
    return null;
  }

  // Check ownership of the destination project.
  const projectId = data.projectId ?? existingTask.projectId;

  const project = await getProjectsCollection().findOne({
    _id: projectId,
    ownerId: ownerObjectId,
  });

  if (!project) {
    return null;
  }

  // Check ownership of the assigned team member.
  if (data.assignedTo) {
    const member = await getTeamMembersCollection().findOne({
      _id: data.assignedTo,
      ownerId: ownerObjectId,
    });

    if (!member) {
      return null;
    }
  }

  return getTasksCollection().findOneAndUpdate(
    {
      _id: taskId,
      projectId: existingTask.projectId,
    },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
}

// Delete task
export async function deleteTask(
  id: string,
  ownerId: string,
): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const projects = await getProjectsCollection().find({
    ownerId: new ObjectId(ownerId),
  }).project<{ _id: ObjectId }>({ _id: 1 }).toArray();

  const projectIds = projects.map((project) => project._id);

  const result = await getTasksCollection().deleteOne({
    _id: new ObjectId(id),
    projectId: { $in: projectIds },
  });

  return result.deletedCount === 1;
}