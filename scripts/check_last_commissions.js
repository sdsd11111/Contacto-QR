const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        console.log('Checking Last 10 Registrations for Commission Status...');

        const [rows] = await c.execute(`
            SELECT id, created_at, status, commission_status, seller_id 
            FROM registraya_vcard_registros 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

check();
