const mysql = require('mysql2/promise');
const fs = require('fs');
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

        const output = [];
        const [rows] = await conn.execute(
            'SELECT * FROM registraya_vcard_registros WHERE id = ?',
            ['f2620beb-0d26-4891-b28e-f98eade2b418']
        );
        output.push('--- AUDIT ID: f2620beb ---');
        output.push(JSON.stringify(rows[0], null, 2));

        const [dulzura] = await conn.execute('SELECT id, slug, nombre FROM registraya_vcard_registros WHERE bio LIKE ?', ['%dulzura%']);
        output.push('\n--- SEARCH "dulzura" ---');
        output.push(JSON.stringify(dulzura, null, 2));

        const [maricela] = await conn.execute('SELECT id, slug, nombre FROM registraya_vcard_registros WHERE nombre LIKE ?', ['%Maricela%']);
        output.push('\n--- SEARCH "Maricela" ---');
        output.push(JSON.stringify(maricela, null, 2));

        fs.writeFileSync('scripts/audit_final.txt', output.join('\n'), 'utf8');
        console.log('Saved to scripts/audit_final.txt');

        await conn.end();
    } catch (e) {
        console.error('Audit failed:', e);
        if (conn) await conn.end();
    }
}

audit();
