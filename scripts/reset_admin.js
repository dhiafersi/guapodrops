const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetPassword() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@guapo.drop']
        );
        console.log("SUCCESS: Admin password reset to 'admin123'");
    } catch (e) {
        console.error("Error resetting password:", e.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
