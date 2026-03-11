const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function compareUsers() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        console.log('Fetching users for comparison...');
        const [rows] = await conn.execute(
            "SELECT * FROM registraya_vcard_registros WHERE slug = 'ups-3mzr'"
        );
        rows.forEach(r => console.log('RECORD_START', JSON.stringify(r), 'RECORD_END'));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await conn.end();
    }
}

compareUsers();
