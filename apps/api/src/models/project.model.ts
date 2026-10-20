import type {ObjectId} from "mongodb";

export type ProjectStatus ="planning"|"active"|"completed";

export interface Project {
    _id?: ObjectId;
    name:string;
    description:string;
    status:ProjectStatus;
    createdAt: Date;
    updatedAt:Date;
}