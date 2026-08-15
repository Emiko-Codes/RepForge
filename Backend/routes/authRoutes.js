import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router(); // A router is a mini version of app that groups related routes together.

router.post("/auth/signup", async (req, res) => { // Route that creates a new user account.
  try { // Runs signup code that could fail, such as database work or password hashing.
    const { email, password, username } = req.body; // Gets the signup form values sent from the frontend.

    if (!email || !password || !username ) { // Makes sure the frontend sent all required fields.
      return res.status(400).json({
        message: "Name email and password are required "
      });
    }

    if (password.length < 8) { // Rejects weak passwords before saving the user.
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    const existingUser = await pool.query( // Checks the database to see if this email is already being used.
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) { // If the email already exists, do not create another account with it.
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10); // Turns the plain password into a secure hash before saving it.

    const result = await pool.query( // Inserts the new user into the users table.
      `
      INSERT INTO users (email, password_hash, username)
      VALUES ($1, $2, $3)
      RETURNING id, email, created_at
      `,
      [email, passwordHash, username]
    );

    const user = result.rows[0]; // Gets the newly created user returned by the database.

    const token = jwt.sign( // Creates a login token immediately after signup.
      { userId: user.id }, // Stores the new user's ID inside the token.
      process.env.JWT_SECRET, // Uses the secret from .env to sign and protect the token.
      { expiresIn: "7d" } // Makes the token expire after 7 days.
    );

    res.status(201).json({ // Sends success response back to the frontend.
      message: "Signup successful.",
      token, // Sends the token so the frontend can save it and keep the user logged in.
      user // Sends the created user's public account info.
    });
  } catch (error) { // Runs if signup fails unexpectedly.
    console.log(error);

    res.status(500).json({
      message: "Could not sign up."
    });
  }
});

router.post("/auth/login", async (req, res) => { // Route that logs in an existing user.
  try { // Runs login code that could fail, such as database lookup or password comparison.
    const { email, password } = req.body; // Gets the login form values sent from the frontend.

    if (!email || !password) { // Makes sure both login fields were provided.
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await pool.query( // Looks for a user account with this email.
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) { // If no user exists with that email, reject the login.
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0]; // Gets the user row from the database result.

    const passwordMatches = await bcrypt.compare(password, user.password_hash); // Compares typed password with saved password hash.

    if (!passwordMatches) { // If the password does not match, reject the login.
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign( // Creates a new token for this login session.
      { userId: user.id }, // Stores the logged-in user's ID inside the token.
      process.env.JWT_SECRET, // Uses the same secret later used by requireAuth to verify the token.
      { expiresIn: "7d" } // Makes this login token expire after 7 days.
    );

    res.json({ // Sends the login result back to the frontend.
      message: "Login successful.",
      token, // Sends the token so the frontend can save it in localStorage.
      user: { // Sends safe user info back to the frontend.
        id: user.id,
        email: user.email
      }
    });
  } catch (error) { // Runs if login fails unexpectedly.
    console.log(error);

    res.status(500).json({
      message: "Could not log in"
    });
  }
});

router.get("/profile/info", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        email,
        username,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.userId]
    );

    res.json({
      email: result.rows[0].email,
      created: result.rows[0].created_at,
      username: result.rows[0].username
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "could not get user info"
    });
  }
});

export default router;
