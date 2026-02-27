const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function find() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectTimeout: 20000
        });

        console.log("Searching for activity in the last 60 minutes...");

        console.log("\n--- RECENT REGISTRATIONS ---");
        const [regs] = await conn.execute(`
            SELECT nombre, whatsapp, status, seller_id, attributed_by_footprint, created_at 
            FROM registraya_vcard_registros 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ORDER BY created_at DESC
        `);
        console.log(JSON.stringify(regs, null, 2));

        console.log("\n--- RECENT FOOTPRINTS (FIELD VISITS) ---");
        const [visits] = await conn.execute(`
            SELECT id, business_name, contact_name, contact_phone, seller_id, created_at 
            FROM registraya_vcard_field_visits 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ORDER BY created_at DESC
        `);
        console.log(JSON.stringify(visits, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) await conn.end();
    }
}

find();
