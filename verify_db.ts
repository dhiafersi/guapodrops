const { Pool } = require("pg");

async function run() {
    const connStr = (process.env.DATABASE_POSTGRES_URL || "").replace(/&supa=base-pooler\.x/, "");
    const pool = new Pool({
        connectionString: connStr.split('?')[0],
        ssl: { rejectUnauthorized: false },
    });
    try {
        const res = await pool.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log("SCHEMA:", res.rows);
    } catch (err) {
        console.error("DB ERR:", err);
    } finally {
        await pool.end();
    }
}
run();
