
import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase,createDatabaseIndexes,} from "./config/database.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();
    await createDatabaseIndexes();


    app.listen(PORT, () => {
      console.log(`TeamFlow API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start TeamFlow API:", error);
    process.exit(1);
  }
}

startServer();
