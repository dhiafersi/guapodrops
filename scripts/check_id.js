const mysql = require('mysql2/promise');

async function checkIdType() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        const [columns] = await pool.execute("DESCRIBE products");
        const idCol = columns.find(c => c.Field === 'id');
        console.log("ID Column Details:");
        console.log(idCol);
    } catch (e) {
        console.error("Error checking ID type:", e.message);
    } finally {
        await pool.end();
    }
}

checkIdType();
