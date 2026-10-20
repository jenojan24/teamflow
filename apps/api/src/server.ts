
import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`TeamFlow API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start TeamFlow API:", error);
    process.exit(1);
  }
}

startServer();
