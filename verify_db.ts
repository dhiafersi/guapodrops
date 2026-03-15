process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require("pg");

async function run() {
    const connStr = "postgres://postgres:cFfrumafjfvV3JUG@db.qyacsmpluouukhosdixj.supabase.co:5432/postgres";
    const pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
    });
    try {
        console.log("Checking users schema...");
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log("USERS:", res.rows);
        
        console.log("\nChecking orders schema...");
        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
        console.log("ORDERS:", res2.rows);

        console.log("\nChecking bids schema...");
        const res3 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bids'");
        console.log("BIDS:", res3.rows);
    } catch (err) {
        console.error("DB ERR:", err);
    } finally {
        await pool.end();
    }
}
run();
