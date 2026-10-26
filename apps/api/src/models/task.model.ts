
import type { ObjectId } from "mongodb";

export type TaskStatus = "todo" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    _id?: ObjectId;
    title: string;
    description: string;
    projectId: ObjectId;
    assignedTo?: ObjectId;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
