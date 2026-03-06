const mysql = require('mysql2/promise');

async function check() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        const [tables] = await pool.execute("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log("Tables:", tableNames.join(", "));

        for (const tableName of tableNames) {
            const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
            console.log(`\n--- ${tableName} ---`);
            columns.forEach(c => {
                console.log(`${c.Field} | ${c.Type} | Null: ${c.Null} | Key: ${c.Key} | Def: ${c.Default}`);
            });
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pool.end();
    }
}

check();
