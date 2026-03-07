import { Pool } from 'pg';

// Prioritize the pooler link from Vercel's Supabase integration if available
const sources = [
    { name: 'DATABASE_POSTGRES_PRISMA_URL', val: process.env.DATABASE_POSTGRES_PRISMA_URL },
    { name: 'DATABASE_URL', val: process.env.DATABASE_URL },
    { name: 'DATABASE_POSTGRES_URL', val: process.env.DATABASE_POSTGRES_URL },
    { name: 'POSTGRES_URL', val: process.env.POSTGRES_URL }
];

const selectedSource = sources.find(s => s.val && s.val.trim().length > 0) || { name: 'DEFAULT', val: 'postgresql://postgres:postgres@localhost:5432/postgres' };
let rawConnectionString = (selectedSource.val || '').trim();

console.log(`📡 DB_SOURCE: [${selectedSource.name}]`);

// Aggressive MySQL prevention: if the connection string starts with mysql, force it to postgres format
// or fallback to localhost postgres if it looks like a local MySQL leftover.
if (rawConnectionString.startsWith('mysql:')) {
    console.warn('⚠️ WARNING: MySQL connection string detected. Overriding to PostgreSQL default.');
    rawConnectionString = 'postgresql://postgres:postgres@localhost:5432/postgres';
}

// Log connection params safely
let dbUrl: URL;
try {
    // Remove supa=base-pooler.x if present as standard pg driver might not like it
    let cleanString = rawConnectionString.replace(/[\?&]supa=base-pooler\.x/, '');
    if (!cleanString.includes('?') && cleanString.includes('&')) {
        cleanString = cleanString.replace('&', '?');
    }

    dbUrl = new URL(cleanString);
    console.log(`🔌 DB_INIT: Targeting ${dbUrl.hostname}:${dbUrl.port || '5432'} (Protocol: ${dbUrl.protocol})`);
    rawConnectionString = cleanString;
} catch (e: any) {
    console.error(`⛔ DATABASE_URL_PARSE_ERROR: ${e.message}`);
    dbUrl = new URL('postgresql://localhost:5432/postgres');
}

if (dbUrl.port === '3306' || rawConnectionString.includes(':3306')) {
    throw new Error("⛔ CRITICAL_ERROR: MySQL port 3306 detected in PostgreSQL driver.");
}

export const pool = new Pool({
    connectionString: rawConnectionString.replace('sslmode=require', 'sslmode=disable'),
    ssl: { rejectUnauthorized: false }
});

/**
 * Helper to easily execute queries.
 * This version supports MySQL-style '?' placeholders by converting them to 
 * PostgreSQL-style '$1, $2, ...' placeholders automatically.
 */
export async function query<T>(sql: string, params: any[] = []): Promise<T> {
    let pgSql = sql;
    let index = 1;

    // Replace MySQL '?' with Postgres '$1', '$2', etc.
    pgSql = pgSql.replace(/\?/g, () => `$${index++}`);

    try {
        const { rows } = await pool.query(pgSql, params);
        return rows as T;
    } catch (error: any) {
        console.error('⛔ DATABASE_QUERY_ERROR:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            query: pgSql.substring(0, 100) + '...'
        });
        throw error;
    }
}
