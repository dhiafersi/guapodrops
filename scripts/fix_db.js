const mysql = require('mysql2/promise');

async function fix() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        const [columns] = await pool.execute("DESCRIBE products");
        const hasDescription = columns.some(c => c.Field === 'description');

        if (!hasDescription) {
            console.log("Adding 'description' column to products table...");
            await pool.execute("ALTER TABLE products ADD COLUMN description TEXT AFTER imageUrl");
            console.log("SUCCESS: 'description' column added.");
        } else {
            console.log("'description' column already exists.");
        }
    } catch (e) {
        console.error("Error fixing DB:", e.message);
    } finally {
        await pool.end();
    }
}

fix();
