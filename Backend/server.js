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
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header missing."
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at
      `,
      [email, passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful.",
      token,
      user
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not sign up."
    });
  }
});
  app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not log in."
    });
  }
});
  

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

app.get("/api/workouts", requireAuth, async (req, res) =>{
  try{
    const result = await pool.query( // we are not doing SELECT * FROM workouts because in the future we do not want to ruturn for example private information stored in the workouts table as it is not needed
      `SELECT                      
      w.id,
      w.title,
      w.workout_date, 
      w.workout_day,
      w.notes, 
      w.created_at,
      COUNT(DISTINCT e.id)::int AS exercise_count, -- Count each exercise ID once, convert the count to an integer, and name it exercise_count.
      COUNT(s.id)::int AS set_count -- Count every set ID, convert the count to an integer, and name it set_count.
      FROM workouts w -- Start with the workouts table and use w as its shorter name.
      WHERE user_id = $1     
      LEFT JOIN exercises e ON e.workout_id = w.id -- Connect each workout to exercises whose workout_id matches the workout ID, while keeping workouts with no exercises.
      LEFT JOIN sets s ON s.exercise_id = e.id -- Connect each exercise to sets whose exercise_id matches the exercise ID, while keeping exercises with no sets.
      GROUP BY w.id -- Put all joined rows with the same workout ID into one group so each workout gets separate counts.
      ORDER BY w.workout_date DESC, w.created_at DESC; -- Sort by newest workout date first, then newest creation time when dates match.  
      `
      , [req.userId]
    );

    res.json({
      workouts: result.rows
    });
  }
  catch (error){
    console.log(error);
    res.status(500).json({
      message: "Could not load workouts"
    });
  }
});


app.get("/api/workouts/:id", async (req, res) => { // Get one full workout using its ID
  const workoutId = req.params.id; // Gets the :id value from the URL

  try {
    const workoutResult = await pool.query( // Get the main workout information
      `
      SELECT
        id,
        title,
        workout_date,
        workout_day,
        notes,
        created_at
      FROM workouts
      WHERE id = $1
      `,
      [workoutId] // Replaces $1 with the workout ID
    );

    if (workoutResult.rows.length === 0) { // Check whether the workout exists
      return res.status(404).json({ // Stop the route and return a 404 error
        message: "Workout not found."
      });
    }

    const exerciseResult = await pool.query( // Get all exercises belonging to this workout
      `
      SELECT
        id,
        workout_id,
        name,
        muscle,
        equipment,
        exercise_order
      FROM exercises
      WHERE workout_id = $1
      ORDER BY exercise_order
      `,
      [workoutId] // Find exercises whose workout_id matches this workout
    );

   const setResult = await pool.query(
      `
      SELECT
        s.id,
        s.exercise_id,
        s.set_order,
        s.weight,
        s.reps,
        s.rpe,
        s.done
      FROM sets s
      INNER JOIN exercises e -- Connect each set to its exercise because sets do not store workout_id also insured that after the matching is made, the rest sets are sill sjown
        ON s.exercise_id = e.id -- Match the set's exercise_id with the correct exercise id
      WHERE e.workout_id = $1
      ORDER BY e.exercise_order, s.set_order
      `,
      [workoutId]
    );

    const exercisesWithSets = exerciseResult.rows.map((exercise) => { // Go through every exercise
      const matchingSets = setResult.rows.filter((set) => { // Search through all the sets
        return set.exercise_id === exercise.id; // Keep sets belonging to the current exercise
      });

      return {
        ...exercise, // Copy all the original exercise properties
        sets: matchingSets // Add the matching sets inside the exercise
      };
    });

    const fullWorkout = {
      ...workoutResult.rows[0], // Copy the main workout information
      exercises: exercisesWithSets // Add all exercises, with their sets, to the workout
    };

    res.json({
      workout: fullWorkout // Send the complete workout object back to React
    });
  } catch (error) {
    console.log(error); // Show the actual error in the backend terminal

    res.status(500).json({
      message: "Could not load workout details." // Send an error response to React
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
app.post("/api/workouts", requireAuth, async (req, res) => { // Runs when React sends a POST request to /api/workouts
  const client = await pool.connect(); // Borrows one PostgreSQL connection from the pool

  try {
    const { title, date, workoutDay, notes, exercises } = req.body; // Gets the workout data sent by React

    if (!title || !date) { // Checks whether the required title or date is missing
      return res.status(400).json({ // Stops the route and sends a client error
        message: "Title and date are required."
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) { // Checks that exercises is a non-empty array
      return res.status(400).json({
        message: "Workout must have at least one exercise."
      });
    }

    await client.query("BEGIN"); // Starts a transaction: everything saves or nothing saves

    const workoutResult = await client.query(
      `
      INSERT INTO workouts (user_id,title, workout_date, workout_day, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [req.user_Id,title, date, workoutDay, notes] // Supplies the values for $1, $2, $3 and $4
    );

    const savedWorkout = workoutResult.rows[0]; // Gets the newly saved workout and its generated ID

    for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) { // Loops through every exercise
      const exercise = exercises[exerciseIndex]; // Gets the exercise at the current array position

      const exerciseResult = await client.query(
        `
        INSERT INTO exercises
          (workout_id, name, muscle, equipment, exercise_order)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          savedWorkout.id, // $1: connects the exercise to the saved workout
          exercise.name, // $2: exercise name
          exercise.muscle, // $3: targeted muscle
          exercise.equipment, // $4: equipment used
          exerciseIndex + 1 // $5: exercise order starting at 1
        ]
      );

      const savedExercise = exerciseResult.rows[0]; // Gets the saved exercise and its generated ID

      for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) { // Loops through every set in this exercise
        const set = exercise.sets[setIndex]; // Gets the set at the current array position

        await client.query(
          `
          INSERT INTO sets
            (exercise_id, set_order, weight, reps, rpe, done)
          VALUES
            ($1, $2, $3, $4, $5, $6)
          `,
          [
            savedExercise.id, // $1: connects the set to the saved exercise
            setIndex + 1, // $2: set order starting at 1
            set.weight === "" ? null : set.weight, // $3: converts an empty weight to null
            set.reps === "" ? null : set.reps, // $4: converts empty reps to null
            set.rpe === "" ? null : set.rpe, // $5: converts an empty RPE to null
            set.done // $6: saves true or false
          ]
        );
      } // Ends the sets loop
    } // Ends the exercises loop

    await client.query("COMMIT"); // Permanently saves the complete workout

    res.status(201).json({ // Sends a successful response back to React
      message: "Full workout saved.",
      workoutId: savedWorkout.id // Returns the generated workout ID
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Cancels all inserts if any part fails

    console.log(error); // Prints the actual error in the backend terminal

    res.status(500).json({ // Sends a server error response back to React
      message: "Could not save full workout."
    });
  } finally {
    client.release(); // Returns the borrowed connection to the pool
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
