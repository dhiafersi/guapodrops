import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function seedAdmin() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'guapo_db'
    });

    try {
        const passwordHash = await bcrypt.hash('admin123', 10);
        const id = Date.now().toString();

        // Ignore duplicate email errors when seeding
        await connection.query(
            `INSERT IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
            [id, 'Guapo Admin', 'admin@guapo.drop', passwordHash, 'ADMIN']
        );

        console.log("Admin seeded. Email: admin@guapo.drop / Password: admin123");
    } catch (e) {
        console.log("Seed failed: ", e);
    } finally {
        connection.end();
    }
}

seedAdmin();
