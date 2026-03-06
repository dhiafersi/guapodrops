const mysql = require('mysql2/promise');

async function testInsert() {
    const pool = mysql.createPool({ host: "localhost", user: "root", password: "", database: "guapo_db" });
    try {
        const id = "TEST_" + Date.now();
        const query = `INSERT INTO products 
            (id, name, imageUrl, description, mode, startPrice, endTime, minIncrement, fixedPrice, stockQty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            id, "Test Product", "https://example.com/img.png", "Test Desc", "STOCK",
            null, null, null, 150, 10
        ];
        await pool.execute(query, values);
        console.log("SUCCESS: Test insert worked!");
    } catch (e) {
        console.error("ERROR DURING INSERT:", e.message);
        console.error("FULL ERROR:", e);
    } finally {
        await pool.end();
    }
}
testInsert();
