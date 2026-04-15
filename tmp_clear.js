const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function clear() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        await connection.execute('UPDATE registraya_vcard_registros SET catalogo_json = NULL WHERE slug = ?', ['activaqr-9ag4']);
        console.log('Cleared catalogo_json');
    } finally {
        await connection.end();
    }
}

clear().catch(console.error);
