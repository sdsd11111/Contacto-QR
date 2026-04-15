const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkOldDB() {
    let conn;
    try {
        // En .env.local las variables OLD están comentadas, las usamos manualmente aquí
        conn = await mysql.createConnection({
            host: 'mysql.us.stackcp.com',
            port: 42473,
            user: 'codigosQR-35303938ed5b',
            password: '5plnsc8lhv',
            database: 'codigosQR-35303938ed5b'
        });

        console.log('--- SEARCHING OLD DB ---');
        const [rows] = await conn.execute(
            'SELECT id, slug, nombre, bio, productos_servicios FROM registraya_vcard_registros WHERE slug LIKE ? OR nombre LIKE ?',
            ['%paula%', '%Paula%']
        );
        
        console.log(JSON.stringify(rows, null, 2));
        await conn.end();
    } catch (e) {
        console.error('Failed to connect to old DB:', e);
        if (conn) await conn.end();
    }
}

checkOldDB();
