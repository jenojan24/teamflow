
import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { Task } from "../models/task.model.js";

function getTasksCollection(): Collection<Task> {
  return getDatabase().collection<Task>("tasks");
}

export async function createTask(
  data: Omit<Task, "_id" | "createdAt" | "updatedAt">,
): Promise<Task> {
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

export async function getTasks(): Promise<Task[]> {
  return getTasksCollection()
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getTasksCollection().findOne({
    _id: new ObjectId(id),
  });
}

export async function updateTask(
  id: string,
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

  const result = await getTasksCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return result;
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const result = await getTasksCollection().deleteOne({
    _id: new ObjectId(id),
  });

  return result.deletedCount === 1;
}
