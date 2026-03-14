const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function audit() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT || '42755'),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        console.log('Fetching Paula\'s Bakery record...');
        const [rows] = await conn.execute(
            'SELECT slug, nombre, last_edited_at, edit_uses_remaining, bio, productos_servicios, etiquetas FROM registraya_vcard_registros WHERE slug = ?',
            ['the-paulas-s-bakery-fkl8']
        );
        
        if (rows.length === 0) {
            console.log('Record not found.');
        } else {
            console.log('Record details:');
            console.log(JSON.stringify(rows[0], null, 2));
        }

        await conn.end();
    } catch (e) {
        console.error('Audit failed:', e);
        if (conn) await conn.end();
    }
}

audit();
