// backend/models/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Supabase requires SSL connections
    },
});

module.exports = pool;
