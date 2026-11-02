
// import dotenv from "dotenv";
// import { MongoClient, type Db } from "mongodb";

// dotenv.config();

// const uri = process.env.MONGODB_URI;

// if (!uri) {
//   throw new Error("MONGODB_URI is missing from the environment");
// }

// const client = new MongoClient(uri);

// let database: Db | null = null;

// export async function connectDatabase(): Promise<Db> {
//   await client.connect();
//   await client.db("admin").command({ ping: 1 });

//   database = client.db("teamflow");

//   console.log("MongoDB Atlas connected successfully");

//   return database;
// }

// export function getDatabase(): Db {
//   if (!database) {
//     throw new Error("Database has not been connected");
//   }

//   return database;
// }



import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from the environment");
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  await client.connect();
  await client.db("admin").command({ ping: 1 });

//   database = client.db("teamflow");
const databaseName=process.env.MONGODB_DATABASE ?? "teamflow"
database = client.db(databaseName)
  console.log("MongoDB connected successfully");

  return database;
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error("Database has not been connected");
  }

  return database;
}


export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

export async function createDatabaseIndexes(): Promise<void> {
  const database = getDatabase();

  await database.collection("users").createIndex(
    { email: 1 },
    { unique: true },
  );

  console.log("Database indexes created successfully");
}