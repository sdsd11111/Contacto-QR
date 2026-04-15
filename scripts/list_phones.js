const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectTimeout: 10000
        });
        const [rows] = await conn.execute('SELECT contact_phone FROM registraya_vcard_field_visits WHERE contact_phone IS NOT NULL LIMIT 10');
        console.log('DATA_START');
        console.log(JSON.stringify(rows));
        console.log('DATA_END');
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) await conn.end();
    }
}
run();
