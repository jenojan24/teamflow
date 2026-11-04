import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { TeamMember } from "../models/team-member.model.js";

function getTeamMembersCollection(): Collection<TeamMember> {
  return getDatabase().collection<TeamMember>("teamMembers");
}

export async function createTeamMember(
  data: Omit<TeamMember, "_id" | "createdAt" | "updatedAt">,
): Promise<TeamMember> {
  const now = new Date();

  const teamMember: TeamMember = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getTeamMembersCollection().insertOne(teamMember);

  return {
    ...teamMember,
    _id: result.insertedId,
  };
}

export async function getTeamMembers(ownerId: string): Promise<TeamMember[]> {
  return getTeamMembersCollection()
    .find({ ownerId: new ObjectId(ownerId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getTeamMemberById(
  id: string,
  ownerId: string,
): Promise<TeamMember | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getTeamMembersCollection().findOne({
    _id: new ObjectId(id),
    ownerId: new ObjectId(ownerId),
  });
}

export async function updateTeamMember(
  id: string,
  ownerId: string,
  data: Partial<Pick<TeamMember, "name" | "email" | "role">>,
): Promise<TeamMember | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getTeamMembersCollection().findOneAndUpdate(
    {
      _id: new ObjectId(id),
      ownerId: new ObjectId(ownerId),
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

export async function deleteTeamMember(
  id: string,
  ownerId: string,
): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const result = await getTeamMembersCollection().deleteOne({
    _id: new ObjectId(id),
    ownerId: new ObjectId(ownerId),
  });

  return result.deletedCount === 1;
}