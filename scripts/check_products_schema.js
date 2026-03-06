const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({ host: "localhost", user: "root", password: "", database: "guapo_db" });
    try {
        const [columns] = await pool.execute("DESCRIBE products");
        console.log("COLUMNS FOR products:");
        columns.forEach(c => console.log(`${c.Field} (${c.Type}) - Null: ${c.Null}, Key: ${c.Key}, Default: ${c.Default}`));
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}
check();
