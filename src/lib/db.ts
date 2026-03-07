import { Pool } from "pg";

const DB_URL_SOURCES = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "DATABASE_POSTGRES_PRISMA_URL",
    "DATABASE_POSTGRES_URL",
    "DATABASE_POSTGRES_URL_NON_POOLING",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_URL_NO_SSL",
] as const;

function getDatabaseConnectionString() {
    for (const key of DB_URL_SOURCES) {
        const value = process.env[key]?.trim();
        if (value) {
            return { key, value };
        }
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error(
            `Missing database connection string. Set one of: ${DB_URL_SOURCES.join(", ")}`
        );
    }

    return {
        key: "DEV_FALLBACK",
        value: "postgresql://postgres:postgres@localhost:5432/postgres",
    };
}

function normalizeConnectionString(connectionString: string) {
    if (connectionString.startsWith("mysql:")) {
        throw new Error("Invalid database protocol: expected PostgreSQL, received MySQL.");
    }

    let normalized = connectionString.replace(/([?&])supa=base-pooler\.x(&)?/, "$1");
    normalized = normalized.replace(/[?&]$/, "");

    return normalized;
}

const selectedSource = getDatabaseConnectionString();
const connectionString = normalizeConnectionString(selectedSource.value);
const dbUrl = new URL(connectionString);
const isLocalDatabase = dbUrl.hostname === "localhost" || dbUrl.hostname === "127.0.0.1";

console.log(`[DB_SOURCE] ${selectedSource.key}`);
console.log(
    `[DB_INIT] Targeting ${dbUrl.hostname}:${dbUrl.port || "5432"} (${dbUrl.protocol})`
);

if (dbUrl.port === "3306" || connectionString.includes(":3306")) {
    throw new Error("Invalid database port: PostgreSQL configuration is pointing at MySQL port 3306.");
}

export const pool = new Pool({
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
});

/**
 * Supports legacy MySQL-style "?" placeholders by converting them to
 * PostgreSQL "$1", "$2", ... placeholders before execution.
 */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T> {
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);

    try {
        const { rows } = await pool.query(pgSql, params);
        return rows as T;
    } catch (error) {
        const dbError = error as Error & { code?: string };
        console.error("[DATABASE_QUERY_ERROR]", {
            message: dbError.message,
            code: dbError.code,
            query: pgSql.substring(0, 100) + "...",
        });
        throw error;
    }
}
