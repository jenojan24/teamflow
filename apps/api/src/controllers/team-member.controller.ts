import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";

import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from "../models/team-member.validation.js";

import {
  createTeamMember,
  getTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "../services/team-member.service.js";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

function getAuthenticatedUser(req: Request) {
  return (req as AuthenticatedRequest).user;
}

// Create team member
export async function createTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createTeamMemberSchema.parse(req.body);
    const user = getAuthenticatedUser(req);

    const teamMember = await createTeamMember({
      ...input,
      ownerId: new ObjectId(user.id),
    });

    res.status(201).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid team member data",
        errors: error.issues,
      });
      return;
    }

    next(error);
  }
}

// Get all team members belonging to logged-in user
export async function getTeamMembersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = getAuthenticatedUser(req);
    const teamMembers = await getTeamMembers(user.id);

    res.status(200).json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    next(error);
  }
}

// Get one team member
export async function getTeamMemberByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = getAuthenticatedUser(req);

    const teamMember = await getTeamMemberById(
      req.params.id as string,
      user.id,
    );

    if (!teamMember) {
      res.status(404).json({
        success: false,
        message: "Team member not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    next(error);
  }
}

// Update team member
export async function updateTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = updateTeamMemberSchema.parse(req.body);
    const user = getAuthenticatedUser(req);

    const teamMember = await updateTeamMember(
      req.params.id as string,
      user.id,
      input,
    );

    if (!teamMember) {
      res.status(404).json({
        success: false,
        message: "Team member not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid team member data",
        errors: error.issues,
      });
      return;
    }

    next(error);
  }
}

// Delete team member
export async function deleteTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = getAuthenticatedUser(req);

    const deleted = await deleteTeamMember(
      req.params.id as string,
      user.id,
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Team member not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}