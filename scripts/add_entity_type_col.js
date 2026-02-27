const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    let conn;
    try {
        console.log("Connecting...");
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        console.log("Adding entity_type column...");
        await conn.execute(`
            ALTER TABLE registraya_vcard_field_visits 
            ADD COLUMN entity_type ENUM('persona', 'empresa') DEFAULT 'persona'
            AFTER contact_name
        `);
        console.log("✅ Column added successfully.");

    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️ Column entity_type already exists.");
        } else {
            console.error("❌ Migration error:", err);
        }
    } finally {
        if (conn) await conn.end();
    }
}

migrate();
