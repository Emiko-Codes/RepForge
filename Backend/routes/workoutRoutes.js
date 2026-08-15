import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router(); // A router keeps workout endpoints together instead of leaving all routes in server.js.

router.get("/workouts", requireAuth, async (req, res) => {
  try {
    const result = await pool.query( // We are not doing SELECT * so only the data the frontend needs is returned.
      `
      SELECT
        w.id,
        w.title,
        w.workout_date,
        w.workout_day,
        w.notes,
        w.created_at,
        COUNT(DISTINCT e.id)::int AS exercise_count,
        COUNT(s.id)::int AS set_count
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      LEFT JOIN sets s ON s.exercise_id = e.id
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.workout_date DESC, w.created_at DESC;
      `,
      [req.userId]
    );

    res.json({
      workouts: result.rows
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not load workouts"
    });
  }
});

router.get("/workouts/:id", requireAuth, async (req, res) => { // Get one full workout using its ID.
  const workoutId = req.params.id; // Gets the :id value from the URL.

  try {
    const workoutResult = await pool.query( // Get the main workout information.
      `
      SELECT
        id,
        title,
        workout_date,
        workout_day,
        notes,
        created_at
      FROM workouts
      WHERE id = $1 AND user_id = $2
      `,
      [workoutId, req.userId] // $2 makes sure users cannot view another user's workout by guessing the ID.
    );

    if (workoutResult.rows.length === 0) { // Check whether the workout exists for this user.
      return res.status(404).json({
        message: "Workout not found."
      });
    }

    const exerciseResult = await pool.query( // Get all exercises belonging to this workout.
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
      [workoutId]
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
      INNER JOIN exercises e
        ON s.exercise_id = e.id
      WHERE e.workout_id = $1
      ORDER BY e.exercise_order, s.set_order
      `,
      [workoutId]
    );

    const exercisesWithSets = exerciseResult.rows.map((exercise) => { // Go through every exercise.
      const matchingSets = setResult.rows.filter((set) => { // Search through all the sets.
        return set.exercise_id === exercise.id; // Keep sets belonging to the current exercise.
      });

      return {
        ...exercise, // Copy all the original exercise properties.
        sets: matchingSets // Add the matching sets inside the exercise.
      };
    });

    const fullWorkout = {
      ...workoutResult.rows[0], // Copy the main workout information.
      exercises: exercisesWithSets // Add all exercises, with their sets, to the workout.
    };

    res.json({
      workout: fullWorkout // Send the complete workout object back to React.
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not load workout details."
    });
  }
});

router.post("/workouts", requireAuth, async (req, res) => { // Runs when React sends a POST request to /api/workouts.
  const client = await pool.connect(); // Borrows one PostgreSQL connection from the pool.

  try {
    const { title, date, workoutDay, notes, exercises } = req.body; // Gets the workout data sent by React.

    if (!title || !date) { // Checks whether the required title or date is missing.
      return res.status(400).json({
        message: "Title and date are required."
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) { // Checks that exercises is a non-empty array.
      return res.status(400).json({
        message: "Workout must have at least one exercise."
      });
    }

    await client.query("BEGIN"); // Starts a transaction: everything saves or nothing saves.

    const workoutResult = await client.query(
      `
      INSERT INTO workouts (user_id, title, workout_date, workout_day, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [req.userId, title, date, workoutDay, notes]
    );

    const savedWorkout = workoutResult.rows[0]; // Gets the newly saved workout and its generated ID.

    for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) { // Loops through every exercise.
      const exercise = exercises[exerciseIndex]; // Gets the exercise at the current array position.

      const exerciseResult = await client.query(
        `
        INSERT INTO exercises
          (workout_id, name, muscle, equipment, exercise_order)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          savedWorkout.id, // $1: connects the exercise to the saved workout.
          exercise.name, // $2: exercise name.
          exercise.muscle, // $3: targeted muscle.
          exercise.equipment, // $4: equipment used.
          exerciseIndex + 1 // $5: exercise order starting at 1.
        ]
      );

      const savedExercise = exerciseResult.rows[0]; // Gets the saved exercise and its generated ID.

      for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) { // Loops through every set in this exercise.
        const set = exercise.sets[setIndex]; // Gets the set at the current array position.

        await client.query(
          `
          INSERT INTO sets
            (exercise_id, set_order, weight, reps, rpe, done)
          VALUES
            ($1, $2, $3, $4, $5, $6)
          `,
          [
            savedExercise.id, // $1: connects the set to the saved exercise.
            setIndex + 1, // $2: set order starting at 1.
            set.weight === "" ? null : set.weight, // $3: converts an empty weight to null.
            set.reps === "" ? null : set.reps, // $4: converts empty reps to null.
            set.rpe === "" ? null : set.rpe, // $5: converts an empty RPE to null.
            set.done // $6: saves true or false.
          ]
        );
      }
    }

    await client.query("COMMIT"); // Permanently saves the complete workout.

    res.status(201).json({
      message: "Full workout saved.",
      workoutId: savedWorkout.id // Returns the generated workout ID.
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Cancels all inserts if any part fails.

    console.log(error);

    res.status(500).json({
      message: "Could not save full workout."
    });
  } finally {
    client.release(); // Returns the borrowed connection to the pool.
  }
});

router.delete("/workouts/:id", requireAuth, async (req, res) => {
  try {
    const workoutId = req.params.id;

    const result = await pool.query(
      `
      DELETE FROM workouts
      WHERE id = $1 AND user_id = $2
      RETURNING id
      `,
      [workoutId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Workout not found."
      });
    }

    res.json({
      message: "Workout deleted."
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not delete workout."
    });
  }
});

export default router;
