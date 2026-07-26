import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connected to Supabase!");
    console.log(result.rows[0]);

    await pool.end();
  } catch (err) {
    console.error("Connection failed");
    console.error(err);
  }
}

testConnection();