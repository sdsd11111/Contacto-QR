const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });
    const [rows] = await conn.execute("DESCRIBE registraya_vcard_field_visits");
    console.log('SCHEMA_START');
    rows.forEach(row => {
        console.log(`${row.Field} | ${row.Type} | ${row.Null} | ${row.Key} | ${row.Default}`);
    });
    console.log('SCHEMA_END');
    await conn.end();
}
check();
