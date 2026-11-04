
import type { ObjectId } from "mongodb";

export type TaskStatus = "todo" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    _id?: ObjectId;
    title: string;
    description: string;
    projectId: ObjectId;
    assignedTo?: ObjectId | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
