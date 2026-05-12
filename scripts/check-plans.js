const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [rows] = await pool.execute('SELECT plan, count(*) as count FROM registraya_vcard_registros GROUP BY plan');
        console.log('Plan counts:', rows);

        const [proDigital] = await pool.execute('SELECT id, nombre, plan, bio, productos_servicios FROM registraya_vcard_registros WHERE plan IN ("pro", "digital", "basic") LIMIT 20');
        console.log('Sample records (pro/digital/basic):', JSON.stringify(proDigital, null, 2));

    } catch (err) {
        console.error('Error details:', err);
    } finally {
        await pool.end();
    }
}

main();
