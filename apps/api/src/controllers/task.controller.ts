
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../models/task.validation.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/task.service.js";
import { getDatabase } from "../config/database.js";

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

  const projectId = parsed.data.projectId;

  if (!ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Invalid project ID" });
    return;
  }

  const project = await getDatabase()
    .collection("projects")
    .findOne({ _id: new ObjectId(projectId) });

  if (!project) {
    res.status(400).json({ message: "Project not found" });
    return;
  }

  if (parsed.data.assignedTo !== undefined) {
    if (!ObjectId.isValid(parsed.data.assignedTo)) {
      res.status(400).json({ message: "Invalid team member ID" });
      return;
    }

    const member = await getDatabase()
      .collection("teamMembers")
      .findOne({ _id: new ObjectId(parsed.data.assignedTo) });

    if (!member) {
      res.status(400).json({ message: "Team member not found" });
      return;
    }
  }

  const task = await createTask({
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
  });

  res.status(201).json(task);
}

export async function getTasksController(
  _req: Request,
  res: Response,
): Promise<void> {
  const tasks = await getTasks();
  res.status(200).json(tasks);
}

export async function getTaskByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  const task = await getTaskById(String(req.params.id));

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.status(200).json(task);
}

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

  const data = parsed.data;
  const updates: Record<string, unknown> = {};

  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.status !== undefined) updates.status = data.status;
  if (data.priority !== undefined) updates.priority = data.priority;

  if (data.projectId !== undefined) {
    if (!ObjectId.isValid(data.projectId)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    const project = await getDatabase()
      .collection("projects")
      .findOne({ _id: new ObjectId(data.projectId) });

    if (!project) {
      res.status(400).json({ message: "Project not found" });
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

      const member = await getDatabase()
        .collection("teamMembers")
        .findOne({ _id: new ObjectId(data.assignedTo) });

      if (!member) {
        res.status(400).json({ message: "Team member not found" });
        return;
      }

      updates.assignedTo = new ObjectId(data.assignedTo);
    }
  }

  if (data.dueDate !== undefined) {
    if (data.dueDate === null) {
      updates.dueDate = null;
    } else {
      updates.dueDate = new Date(data.dueDate);
    }
  }

  const task = await updateTask(String(req.params.id), updates);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.status(200).json(task);
}

export async function deleteTaskController(
  req: Request,
  res: Response,
): Promise<void> {
  const deleted = await deleteTask(String(req.params.id));

  if (!deleted) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.status(204).send();
}
