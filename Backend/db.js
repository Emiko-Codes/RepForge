import pg from "pg"; // Imports the PostgreSQL package.

import dotenv from "dotenv"; // Imports dotenv so the backend can read the .env file.

dotenv.config(); // Loads values from .env into process.env.

const { Pool } = pg; // Gets the Pool class from the pg package.

export const pool = new Pool({ // Creates and exports a reusable PostgreSQL connection pool.
  connectionString: process.env.DATABASE_URL // Uses the database address stored in .env.
});