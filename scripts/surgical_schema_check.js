const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({ host: "localhost", user: "root", password: "", database: "guapo_db" });
    try {
        const [columns] = await pool.execute("SHOW COLUMNS FROM products");
        console.log("--- START SCHEMA ---");
        for (const c of columns) {
            console.log(`COL_NAME: ${c.Field}`);
            console.log(`COL_TYPE: ${c.Type}`);
            console.log(`COL_NULL: ${c.Null}`);
            console.log(`COL_KEY: ${c.Key}`);
            console.log(`------------------`);
        }
        console.log("--- END SCHEMA ---");
    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        await pool.end();
    }
}
check();
