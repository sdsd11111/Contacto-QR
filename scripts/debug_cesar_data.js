const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const config = {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    };
    const conn = await mysql.createConnection(config);

    console.log('--- Cesar (ID 11) Info ---');
    const [seller] = await conn.execute('SELECT * FROM registraya_vcard_sellers WHERE id = 11');
    console.log('Seller:', seller[0]);

    console.log('\n--- Team Members (Children) ---');
    const [children] = await conn.execute('SELECT id, nombre, codigo FROM registraya_vcard_sellers WHERE parent_id = 11');
    console.log('Children:', children);

    const childrenIds = children.map(c => c.id);
    const allIds = [11, ...childrenIds];

    console.log('\n--- Registrations for ID list:', allIds, ' ---');
    const placeholders = allIds.map(() => '?').join(', ');
    const [registros] = await conn.execute(`SELECT id, nombre, seller_id, created_at FROM registraya_vcard_registros WHERE seller_id IN (${placeholders}) ORDER BY created_at DESC`, allIds);
    console.log('Count:', registros.length);
    console.log('First 5:', registros.slice(0, 5));

    await conn.end();
}

run();
