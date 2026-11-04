
import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../models/project.validation.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/project.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

function getAuthenticatedUser(req: Request) {
  return (req as AuthenticatedRequest).user;
}

export async function createProjectController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createProjectSchema.parse(req.body);
    const user = getAuthenticatedUser(req);

    const project = await createProject({
      ...input,
      ownerId: new ObjectId(user.id),
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: error.issues,
      });
      return;
    }

    next(error);
  }
}

export async function getProjectsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = getAuthenticatedUser(req);
    const projects = await getProjects(user.id);

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = getAuthenticatedUser(req);
    const project = await getProjectById(
      req.params.id as string,
      user.id,
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = updateProjectSchema.parse(req.body);
    const user = getAuthenticatedUser(req);

    const project = await updateProject(
      req.params.id as string,
      user.id,
      input,
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: error.issues,
      });
      return;
    }

    next(error);
  }
}

export async function deleteProjectController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = getAuthenticatedUser(req);
    const deleted = await deleteProject(
      req.params.id as string,
      user.id,
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
