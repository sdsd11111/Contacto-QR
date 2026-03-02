const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT)
    };

    const c = await mysql.createConnection(config);
    try {
        const [rows] = await c.query("SELECT id, nombre, email FROM registraya_vcard_sellers WHERE nombre LIKE '%Cesar%'");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
    }
}

check();
