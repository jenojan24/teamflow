import type { Request, Response } from "express";
import { ObjectId } from "mongodb";

import {
  createTaskSchema,
  updateTaskSchema,
} from "../models/task.validation.js";

import type { Task } from "../models/task.model.js";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/task.service.js";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

function getAuthenticatedUser(req: Request) {
  return (req as AuthenticatedRequest).user;
}

// Create task
export async function createTaskController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid task data",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const user = getAuthenticatedUser(req);
  const projectId = parsed.data.projectId;

  if (!ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Invalid project ID" });
    return;
  }

  if (
    parsed.data.assignedTo &&
    !ObjectId.isValid(parsed.data.assignedTo)
  ) {
    res.status(400).json({ message: "Invalid team member ID" });
    return;
  }

  const task = await createTask(
    {
      title: parsed.data.title,
      description: parsed.data.description,
      projectId: new ObjectId(projectId),
      ...(parsed.data.assignedTo
        ? { assignedTo: new ObjectId(parsed.data.assignedTo) }
        : {}),
      status: parsed.data.status,
      priority: parsed.data.priority,
      ...(parsed.data.dueDate
        ? { dueDate: new Date(parsed.data.dueDate) }
        : {}),
    },
    user.id,
  );

  if (!task) {
    res.status(400).json({
      message: "Project or assigned team member not found or not accessible",
    });
    return;
  }

  res.status(201).json(task);
}

// Get all tasks belonging to logged-in user
export async function getTasksController(
  req: Request,
  res: Response,
): Promise<void> {
  const user = getAuthenticatedUser(req);
  const tasks = await getTasks(user.id);

  res.status(200).json(tasks);
}

// Get one task
export async function getTaskByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  const user = getAuthenticatedUser(req);

  const task = await getTaskById(
    String(req.params.id),
    user.id,
  );

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.status(200).json(task);
}

// Update task
export async function updateTaskController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid task data",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const user = getAuthenticatedUser(req);
  const data = parsed.data;

  const updates: Partial<
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
  > = {};

  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.status !== undefined) updates.status = data.status;
  if (data.priority !== undefined) updates.priority = data.priority;

  if (data.projectId !== undefined) {
    if (!ObjectId.isValid(data.projectId)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    updates.projectId = new ObjectId(data.projectId);
  }

  if (data.assignedTo !== undefined) {
    if (data.assignedTo === null) {
      updates.assignedTo = null;
    } else {
      if (!ObjectId.isValid(data.assignedTo)) {
        res.status(400).json({ message: "Invalid team member ID" });
        return;
      }

      updates.assignedTo = new ObjectId(data.assignedTo);
    }
  }

  if (data.dueDate !== undefined) {
    updates.dueDate = data.dueDate === null
      ? null
      : new Date(data.dueDate);
  }

  const task = await updateTask(
    String(req.params.id),
    user.id,
    updates,
  );

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.status(200).json(task);
}

// Delete task
export async function deleteTaskController(
  req: Request,
  res: Response,
): Promise<void> {
  const user = getAuthenticatedUser(req);

  const deleted = await deleteTask(
    String(req.params.id),
    user.id,
  );

  if (!deleted) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.status(204).send();
}