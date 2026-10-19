import dotenv from "dotenv"
import { MongoClient } from "mongodb";


dotenv.config();

const uri=process.env.MONGODB_URI;

if(!uri){
    throw new Error("MONGODB_URI is missing from the environment");
}

const client = new MongoClient(uri);

export async function connectDatabase(){
    await client.connect();

    // verify that atlas responds to a database command.
    await client.db("admin").command({ping: 1})
    console.log("mongodb atlas connected successfully")

    return client.db("teamflow");
}