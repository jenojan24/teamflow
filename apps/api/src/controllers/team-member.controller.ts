
import type { Request, Response, NextFunction } from "express";
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

export async function createTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createTeamMemberSchema.parse(req.body);
    const teamMember = await createTeamMember(input);

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

export async function getTeamMembersController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const teamMembers = await getTeamMembers();

    res.status(200).json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeamMemberByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const teamMember = await getTeamMemberById(req.params.id as string);

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

export async function updateTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = updateTeamMemberSchema.parse(req.body);
    const teamMember = await updateTeamMember(
      req.params.id as string,
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

export async function deleteTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const deleted = await deleteTeamMember(req.params.id as string);

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
