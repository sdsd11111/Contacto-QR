const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' }); // or .env.local

async function createTable() {
    console.log("Connecting to the database...");
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    console.log("Connected. Creating table...");
    const query = `
        CREATE TABLE IF NOT EXISTS vcard_downloads_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(255) NOT NULL,
            method VARCHAR(50) DEFAULT 'profile_button',
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_slug (slug),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
        await connection.execute(query);
        console.log("✅ Table 'vcard_downloads_log' created successfully!");
    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        await connection.end();
    }
}

createTable();
