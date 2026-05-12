const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function main() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const [rows] = await pool.execute('SELECT id, nombre, email FROM registraya_vcard_sellers WHERE nombre LIKE ?', ['%Cesar%']);
        console.log('SELLERS FOUND:');
        console.log(JSON.stringify(rows, null, 2));
        await pool.end();
    } catch (err) {
        console.error('ERROR:', err);
    }
}

main();
