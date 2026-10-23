
import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { Project } from "../models/project.model.js";

function getProjectsCollection(): Collection<Project> {
  return getDatabase().collection<Project>("projects");
}

export async function createProject(
  data: Omit<Project, "_id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  const now = new Date();

  const project: Project = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await getProjectsCollection().insertOne(project);

  return {
    ...project,
    _id: result.insertedId,
  };
}

export async function getProjects(): Promise<Project[]> {
  return getProjectsCollection().find().sort({ createdAt: -1 }).toArray();
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return getProjectsCollection().findOne({
    _id: new ObjectId(id),
  });
}

export async function updateProject(
  id: string,
  data: Partial<Pick<Project,  "name" | "description" | "status" | "priority">>,
): Promise<Project | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await getProjectsCollection().findOneAndUpdate(
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

export async function deleteProject(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const result = await getProjectsCollection().deleteOne({
    _id: new ObjectId(id),
  });

  return result.deletedCount === 1;
}
