const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
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

        console.log("--- FINAL CHECK FOR CRISTHOPHER REYES ---");

        const [regs] = await conn.execute(`
            SELECT nombre, whatsapp, seller_id, attributed_by_footprint, created_at 
            FROM registraya_vcard_registros 
            WHERE nombre LIKE '%Cristhopher%' OR nombre LIKE '%Reyes%'
            ORDER BY created_at DESC LIMIT 1
        `);

        if (regs.length > 0) {
            const r = regs[0];
            console.log(`FOUND_REG: ${r.nombre} | ${r.whatsapp} | Seller: ${r.seller_id} | Footprint: ${r.attributed_by_footprint === 1 ? 'YES' : 'NO'}`);

            const [v] = await conn.execute("SELECT id, seller_id FROM registraya_vcard_field_visits WHERE contact_phone = ? LIMIT 1", [r.whatsapp]);
            if (v.length > 0) {
                console.log(`MATCHING_VISIT: ID ${v[0].id} | Seller ${v[0].seller_id}`);
            } else {
                console.log("NO_MATCHING_VISIT_FOUND");
            }
        } else {
            console.log("CRISTHOPHER_REYES_NOT_FOUND");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) await conn.end();
    }
}

check();
