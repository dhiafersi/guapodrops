const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({ host: "localhost", user: "root", password: "", database: "guapo_db" });
    try {
        const [columns] = await pool.execute("SHOW COLUMNS FROM products");
        console.log("COLUMNS FOR products:");
        columns.forEach(c => {
            console.log(`Column: ${c.Field}, Type: ${c.Type}, Null: ${c.Null}, Key: ${c.Key}, Default: ${c.Default}`);
        });
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pool.end();
    }
}
check();
