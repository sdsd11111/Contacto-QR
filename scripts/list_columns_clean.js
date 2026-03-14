const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function listColumns() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT || '42755'),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        const [rows] = await conn.execute('SHOW COLUMNS FROM registraya_vcard_registros');
        console.log('Columns:');
        rows.forEach(r => console.log(r.Field));

        await conn.end();
    } catch (e) {
        console.error('Failed to list columns:', e);
        if (conn) await conn.end();
    }
}

listColumns();
