const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgres://postgres.qyacsmpluouukhosdixj:cFfrumafjfvV3JUG@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=disable',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    const res = await client.query(
        "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position"
    );
    const grouped = {};
    res.rows.forEach(r => {
        if (!grouped[r.table_name]) grouped[r.table_name] = [];
        grouped[r.table_name].push(r.column_name);
    });
    console.log(JSON.stringify(grouped, null, 2));
    await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
