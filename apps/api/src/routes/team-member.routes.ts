
import { Router } from "express";
import {
  createTeamMemberController,
  getTeamMembersController,
  getTeamMemberByIdController,
  updateTeamMemberController,
  deleteTeamMemberController,
} from "../controllers/team-member.controller.js";

const router = Router();

router.post("/", createTeamMemberController);
router.get("/", getTeamMembersController);
router.get("/:id", getTeamMemberByIdController);
router.patch("/:id", updateTeamMemberController);
router.delete("/:id", deleteTeamMemberController);

export default router;
