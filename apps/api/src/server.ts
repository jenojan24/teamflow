
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "TeamFlow API is running",
  });
});

async function startServer(){
  try{
    await connectDatabase();
    app.listen(PORT,() =>{
      console.log(`TeamFlow API running at http://localhost:${PORT}`);
    });
  }catch(error){
    console.error("failed to start TeamFlow API:",error)
    process.exit(1);
  }
}
startServer();