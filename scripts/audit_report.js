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

        const [rows] = await conn.execute(
            'SELECT slug, nombre, last_edited_at, edit_uses_remaining, bio, productos_servicios FROM registraya_vcard_registros WHERE slug = ?',
            ['the-paulas-s-bakery-fkl8']
        );
        
        if (rows.length > 0) {
            const r = rows[0];
            console.log('--- AUDIT REPORT ---');
            console.log('Slug:', r.slug);
            console.log('Nombre:', r.nombre);
            console.log('Last Edited:', r.last_edited_at);
            console.log('Remaining Uses:', r.edit_uses_remaining);
            console.log('Bio:', r.bio);
            console.log('Products:', r.productos_servicios);
        } else {
            console.log('Record not found.');
        }

        await conn.end();
    } catch (e) {
        console.error('Audit failed:', e);
        if (conn) await conn.end();
    }
}

audit();
