import express from "express";
import cors from "cors"; // CORS tells browsers which frontends may read the server's responses.
import dotenv from "dotenv"; // Dotenv manages the server's settings.
import { pool } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config(); // Loads variables from your .env file into process.env.

const app = express(); // Creates the Express application.
const PORT = process.env.PORT || 5001; // Use the environment port, or 5001 for local development.

app.use(cors({
  origin: process.env.CLIENT_URL
}));// Allows the frontend to make requests to this backend.
app.use(express.json()); // Converts incoming JSON request bodies into req.body.

app.use("/api", authRoutes); // Auth routes become /api/auth/signup, /api/auth/login, and /api/profile/info.
app.use("/api", workoutRoutes); // Workout routes become /api/workouts and /api/workouts/:id.
app.use("/api", statsRoutes); // Stats routes become /api/stats/recent-workouts, /api/weekly-volume, etc.

app.get("/", (req, res) => {
  res.json({
    message: "backend is running" // Confirms that the backend server is running.
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed."
    });
  }
});

app.listen(PORT, () => { // Runs once the server has successfully started.
  console.log(`Server is running on http://localhost:${PORT}`);
});
