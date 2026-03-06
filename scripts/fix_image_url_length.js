const mysql = require('mysql2/promise');

async function fixSchema() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        console.log("Expanding 'imageUrl' column capacity...");
        // Change imageUrl from varchar(191) to TEXT to accommodate long URLs
        await pool.execute("ALTER TABLE products MODIFY COLUMN imageUrl TEXT");
        console.log("SUCCESS: 'imageUrl' column is now TEXT type.");
    } catch (e) {
        console.error("Error fixing schema:", e.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
