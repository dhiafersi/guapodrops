const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        console.log("Adding 'location' column to users...");
        await pool.execute("ALTER TABLE users ADD COLUMN location VARCHAR(255) AFTER phone");
        console.log("SUCCESS: 'location' column added.");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await pool.end();
    }
}

migrate();
