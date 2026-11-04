
import type { ObjectId } from "mongodb";

export type TeamMemberRole =
  | "developer"
  | "designer"
  | "project-manager"
  | "tester"
  | "other";

export interface TeamMember {
  _id?: ObjectId;
  ownerId: ObjectId;
  name: string;
  email: string;
  role: TeamMemberRole;
  createdAt: Date;
  updatedAt: Date;
}
