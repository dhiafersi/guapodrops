const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "guapo_db",
    });

    try {
        console.log("Dropping existing order tables for clean state...");
        await pool.execute(`DROP TABLE IF EXISTS order_items`);
        await pool.execute(`DROP TABLE IF EXISTS orders`);

        console.log("Creating orders table...");
        await pool.execute(`
            CREATE TABLE orders (
                id VARCHAR(100) PRIMARY KEY,
                userId VARCHAR(191) NOT NULL,
                totalAmount DECIMAL(10, 2) NOT NULL,
                status ENUM('PENDING', 'CALLED', 'VERIFIED', 'SHIPPED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);

        console.log("Creating order_items table...");
        await pool.execute(`
            CREATE TABLE order_items (
                id VARCHAR(100) PRIMARY KEY,
                orderId VARCHAR(100) NOT NULL,
                productId VARCHAR(100) NOT NULL,
                quantity INT NOT NULL,
                priceAtTime DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (orderId) REFERENCES orders(id),
                FOREIGN KEY (productId) REFERENCES products(id)
            )
        `);

        console.log("SUCCESS: Orders schema correctly implemented.");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await pool.end();
    }
}

migrate();
