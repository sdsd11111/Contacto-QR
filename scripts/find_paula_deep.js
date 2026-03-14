const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function findPaula() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT || '42755'),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        console.log('Searching by exact ID from screenshot...');
        const [idRows] = await conn.execute('SELECT id, slug, nombre, last_edited_at, bio, productos_servicios FROM registraya_vcard_registros WHERE id = ?', ['F2620BEB-0D26-4891-B28E-F98EADE2B418']);
        console.log('--- ID Match (from screenshot) ---');
        console.log(JSON.stringify(idRows, null, 2));

        console.log('\nSearching for any records containing "Paula" or "Bakery" in any field...');
        const [searchRows] = await conn.execute(
            'SELECT id, slug, nombre, last_edited_at, bio, productos_servicios FROM registraya_vcard_registros WHERE slug LIKE ? OR nombre LIKE ? OR bio LIKE ?',
            ['%bakery%', '%Paula%', '%Bakery%']
        );
        console.log('--- Broad Search Results ---');
        searchRows.forEach(r => {
            console.log(`SLUG: [${r.slug}] | NAME: [${r.nombre}] | ID: ${r.id} | Last Edited: ${r.last_edited_at}`);
        });

        await conn.end();
    } catch (e) {
        console.error('Search failed:', e);
        if (conn) await conn.end();
    }
}

findPaula();
