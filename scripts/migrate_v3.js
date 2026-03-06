const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        console.log("Starting migration...");

        // 1. Add phone to users
        const [userCols] = await pool.execute("DESCRIBE users");
        if (!userCols.some(c => c.Field === 'phone')) {
            console.log("Adding 'phone' column to users...");
            await pool.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email");
        }

        // 2. Add images to products (for multiple photos)
        const [prodCols] = await pool.execute("DESCRIBE products");
        if (!prodCols.some(c => c.Field === 'images')) {
            console.log("Adding 'images' column to products...");
            // We'll store a JSON string of URLs
            await pool.execute("ALTER TABLE products ADD COLUMN images TEXT AFTER imageUrl");
        }

        // 3. Create cart_items table
        console.log("Ensuring cart_items table exists...");
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id VARCHAR(191) PRIMARY KEY,
                userId VARCHAR(191) NOT NULL,
                productId VARCHAR(191) NOT NULL,
                quantity INT DEFAULT 1,
                createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                INDEX (userId),
                INDEX (productId)
            )
        `);

        console.log("MIGRATION SUCCESSFUL");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await pool.end();
    }
}

migrate();
