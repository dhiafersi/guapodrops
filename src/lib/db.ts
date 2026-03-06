import mysql from 'mysql2/promise';

// Create the connection pool. The pool-specific settings are the defaults
export const pool = mysql.createPool({
    host: "localhost",     // using Laragon defaults
    user: "root",          // using Laragon defaults
    password: "",          // using Laragon defaults
    database: "guapo_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

/**
 * Helper to easily execute queries
 */
export async function query<T>(sql: string, params: any[] = []): Promise<T> {
    const [results] = await pool.execute(sql, params);
    return results as T;
}
