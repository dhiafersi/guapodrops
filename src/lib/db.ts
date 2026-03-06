import { Pool } from 'pg';

// Prioritize Supabase/PostgreSQL connection strings
let rawConnectionString =
    process.env.DATABASE_URL ||
    process.env.DATABASE_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_POSTGRES_PRISMA_URL ||
    'postgresql://postgres:postgres@localhost:5432/postgres';

// Aggressive MySQL prevention: if the connection string starts with mysql, force it to postgres format
// or fallback to localhost postgres if it looks like a local MySQL leftover.
if (rawConnectionString.startsWith('mysql:')) {
    console.warn('⚠️ WARNING: MySQL connection string detected. Overriding to PostgreSQL default.');
    rawConnectionString = 'postgresql://postgres:postgres@localhost:5432/postgres';
}

// Ensure we are NOT using port 3306 (MySQL default) for Postgres
if (rawConnectionString.includes(':3306')) {
    console.warn('⚠️ WARNING: Port 3306 detected in connection string. Forcing port 5432.');
    rawConnectionString = rawConnectionString.replace(':3306', ':5432');
}

export const pool = new Pool({
    connectionString: rawConnectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection params during build/init to debug Vercel logs
console.log(`🔌 DB Init: Targeting ${new URL(rawConnectionString).hostname}:${new URL(rawConnectionString).port || '5432'}`);

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
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
}
