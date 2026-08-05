import express from "express";
import cors from "cors";//CORS tells browsers which frontends may read the server’s responses.
import dotenv from "dotenv"; //Dotenv manages the server’s settings.
import { pool } from "./db.js"// ONE MAJOR ERROR FACE WAS NOT ADDINF THE . BEFOR THE / WHICH CAUSED THE BACKEND SERVER TO CRASH 


dotenv.config(); // Loads variables from your .env file into Node’s environment so the server can access configuration values through process.env.

const app = express();// creates the express application and stores it in the variable app. The variable app is used to configure and run the backend

app.use(cors());//Adds CORS middleware to the application. It adds permission-related headers to responses so browsers can allow requests between the frontend and backend when they have different origins.
app.use(express.json()); //Adds JSON-parsing middleware. It reads incoming request bodies containing JSON and converts them into JavaScript data that the routes can access through req.body.

const PORT = process.env.PORT || 5001;//Use the port provided by the environment. If no port was provided, use port 5001.
/*
process contains information and controls related to the running Node.js program.
process.env is only the part of process that contains environment variables, which are usually configuration values.
*/

app.get("/", (req, res) =>{
    res.json({
        message: "backend is running"     //When someone sends a GET request to the root route, send back a JSON message confirming that the backend is running.
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

app.post("/api/workouts/basic", async (req, res) => {
  try {
    const { title, date, workoutDay, notes } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: "Title and date are required."
      });
    }

    const result = await pool.query(
      `
      INSERT INTO workouts (title, workout_date, workout_day, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [title, date, workoutDay, notes]
    );

    res.status(201).json({
      message: "Workout title/date saved.",
      workout: result.rows[0]
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not save workout."
    });
  }
});
app.post("/api/workouts/test", (req, res) =>{
    const workout = req.body
    console.log("workout recieved from react:")
    console.log("workout");

    res.status(201).json({ //status code 201 means the request succeeded and a new resource was created or accepted as newly created.
        message: "workout received by backend", 
        workout

    });
});

app.listen(PORT, () => {   //is a callback function that runs once the server has successfully started listening.
  console.log(`Server is running on http://localhost:${PORT}`); //Start the backend on the selected port, and once it starts successfully, print its local address in the terminal.
});
