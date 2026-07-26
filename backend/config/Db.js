import pg from "pg";
 
const { Pool } = pg;
 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase yeu cau SSL
});
 
export default pool;