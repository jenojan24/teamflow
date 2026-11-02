
import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js";
import teamMemberRoutes from "./routes/team-member.routes.js";
import taskRoues from "./routes/task.routes.js"
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "TeamFlow API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/tasks", taskRoues);


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("API error:", error);

    if (
      error instanceof SyntaxError &&
      "status" in error &&
      error.status === 400
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON in request body",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

export default app;
