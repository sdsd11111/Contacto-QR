import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function debugQuery() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    // We only filter for 'pendiente' and 'Sharwest'
    const [rows]: any = await db.execute(`
        SELECT id, nombre, seller_id, created_at, NOW() as now, DATE_SUB(NOW(), INTERVAL 1 DAY) as one_day_ago
        FROM registraya_vcard_registros 
        WHERE nombre LIKE '%Sharwest%'
        AND status = 'pendiente'
    `);

    console.log(JSON.stringify(rows, null, 2));

    if (rows.length > 0) {
        const r = rows[0];
        const created = new Date(r.created_at);
        const oneDayAgo = new Date(r.one_day_ago);
        console.log('\nCreated:', created.toISOString());
        console.log('One Day Ago:', oneDayAgo.toISOString());
        console.log('Created <= One Day Ago?', created <= oneDayAgo);
        console.log('Seller ID:', r.seller_id);
    }

    await db.end();
}

debugQuery().catch(console.error);
