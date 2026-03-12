const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: parseInt(process.env.MYSQL_PORT)
    });

    try {
        console.log("Adding hero_button_text column...");
        await pool.execute(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN IF NOT EXISTS hero_button_text VARCHAR(255) DEFAULT NULL;
        `);
        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
