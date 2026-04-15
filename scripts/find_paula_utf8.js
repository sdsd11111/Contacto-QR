const mysql = require('mysql2/promise');
const fs = require('fs');
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

        const output = [];
        
        const [idRows] = await conn.execute('SELECT id, slug, nombre, last_edited_at, bio FROM registraya_vcard_registros WHERE id = ?', ['F2620BEB-0D26-4891-B28E-F98EADE2B418']);
        output.push('--- ID Match (from screenshot) ---');
        output.push(JSON.stringify(idRows, null, 2));

        const [searchRows] = await conn.execute(
            'SELECT id, slug, nombre, last_edited_at, bio FROM registraya_vcard_registros WHERE slug LIKE ? OR nombre LIKE ? OR bio LIKE ?',
            ['%paula%', '%Paula%', '%PAULA%']
        );
        output.push('\n--- Broad Search Results ---');
        searchRows.forEach(r => {
            output.push(`ID: ${r.id} | SLUG: [${r.slug}] | NAME: [${r.nombre}] | Last Edited: ${r.last_edited_at} | Bio: ${r.bio?.substring(0, 50)}...`);
        });

        fs.writeFileSync('scripts/paula_results_utf8.txt', output.join('\n'), 'utf8');
        console.log('Results saved to scripts/paula_results_utf8.txt');

        await conn.end();
    } catch (e) {
        console.error('Search failed:', e);
        if (conn) await conn.end();
    }
}

findPaula();
