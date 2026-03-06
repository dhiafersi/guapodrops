const mysql = require('mysql2/promise');

async function checkUsers() {
    const pool = mysql.createPool({ host: "localhost", user: "root", password: "", database: "guapo_db" });
    try {
        const [columns] = await pool.execute("DESCRIBE users");
        console.log("COLUMNS FOR users:");
        columns.forEach(c => console.log(`${c.Field} (${c.Type}) - Null: ${c.Null}, Key: ${c.Key}`));
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}
checkUsers();
