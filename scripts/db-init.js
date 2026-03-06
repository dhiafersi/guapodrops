import mysql from 'mysql2/promise';

async function generateSchema() {
    console.log("Connecting to MySQL to create guapo_db...");

    // Connection without database to create the database first
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
    });

    try {
        // Recreate database to ensure a clean state during development setup
        await connection.query('CREATE DATABASE IF NOT EXISTS guapo_db');
        console.log("Database guapo_db created or already exists.");

        await connection.query('USE guapo_db');

        // Users Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191),
        email VARCHAR(191) UNIQUE,
        password VARCHAR(191),
        role ENUM('USER', 'ADMIN') DEFAULT 'USER',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
      )
    `);

        // Products Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        description TEXT,
        imageUrl VARCHAR(191),
        mode ENUM('BIDDING', 'STOCK') NOT NULL,
        startPrice DOUBLE,
        minIncrement DOUBLE,
        endTime DATETIME(3),
        fixedPrice DOUBLE,
        stockQty INT,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

        // Bids Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id VARCHAR(191) PRIMARY KEY,
        amount DOUBLE NOT NULL,
        productId VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // Orders Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(191) PRIMARY KEY,
        productId VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        quantity INT DEFAULT 1,
        totalPrice DOUBLE NOT NULL,
        status VARCHAR(191) DEFAULT 'PENDING',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        console.log("Schema generated successfully!");
    } catch (error) {
        console.error("Error generating schema:", error);
    } finally {
        await connection.end();
    }
}

generateSchema();
