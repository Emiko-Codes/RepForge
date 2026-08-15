import express from "express";
import OpenAI from "openai";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router(); // This groups dashboard stats and AI routes together.

router.post("/ai/coach", requireAuth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required."
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY // Create the OpenAI client when this route runs, after env variables are loaded.
    });

    const recentResult = await pool.query(
      `
      SELECT
        w.workout_day,
        w.workout_date,
        COALESCE(SUM(s.weight * s.reps), 0)::int AS workout_volume,
        COUNT(DISTINCT e.id)::int AS exercise_count,
        COUNT(s.id)::int AS set_count
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      LEFT JOIN sets s ON s.exercise_id = e.id AND s.done = true
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.workout_date DESC, w.created_at DESC
      LIMIT 5
      `,
      [req.userId]
    );

    const aiResponse = await openai.responses.create({
      model: "gpt-5",
      input: `
        You are RepForge AI, a helpful workout coach.

        Rules:
        - Keep the answer short and practical.
        - Use the user's workout data.
        - Do not give medical advice.

        User question:
        ${question}

        Recent workouts:
        ${JSON.stringify(recentResult.rows, null, 2)}
      `
    });

    res.json({
      reply: aiResponse.output_text
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not get RepForge AI response."
    });
  }
});

router.get("/stats/recent-workouts", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        w.id,
        w.workout_day,
        w.workout_date,
        COALESCE(SUM(s.weight * s.reps), 0)::int AS workout_volume
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      LEFT JOIN sets s ON s.exercise_id = e.id AND s.done = true
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.workout_date DESC, w.created_at DESC
      LIMIT 3
      `,
      [req.userId]
    );

    res.json({
      recentWorkouts: result.rows
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not load recent workouts."
    });
  }
});

router.get("/weekly-volume", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        w.id,
        w.workout_day,
        w.workout_date,
        COALESCE(SUM(s.weight * s.reps), 0)::int AS workout_volume
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      LEFT JOIN sets s ON s.exercise_id = e.id AND s.done = true
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.workout_date DESC, w.created_at DESC
      LIMIT 7
      `,
      [req.userId]
    );

    const weeklyvolume = result.rows.reduce((total, workout) => {
      return total + workout.workout_volume;
    }, 0);

    res.json({
      weeklyvolume: weeklyvolume
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "could not load weekly volume"
    });
  }
});

router.get("/weekly-workout-count", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS weekly_workout_count
      FROM workouts
      WHERE user_id = $1
        AND workout_date >= CURRENT_DATE - INTERVAL '6 days'
        AND workout_date <= CURRENT_DATE
      `,
      [req.userId]
    );

    res.json({
      weeklyWorkoutCount: result.rows[0].weekly_workout_count
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "could not load weekly workout count"
    });
  }
});

export default router;
