require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkSellers() {
    const pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: process.env.MYSQL_PORT, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE });
    try {
        const [rows] = await pool.execute('SELECT id, nombre, email, role, code, parent_id FROM registraya_vcard_sellers ORDER BY id DESC LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.log('DB_ERROR: ' + err.message);
    } finally {
        await pool.end();
    }
}
checkSellers();
