import type {ObjectId} from "mongodb";

export type ProjectStatus ="planning"|"active"|"completed";

export type ProjectPriority = "low"|"medium"|"high";

export interface Project {
    _id?: ObjectId;
    ownerId: ObjectId;
    name:string;
    description:string;
    status:ProjectStatus;
    priority: ProjectPriority;
    createdAt: Date;
    updatedAt:Date;
}