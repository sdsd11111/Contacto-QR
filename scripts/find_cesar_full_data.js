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

        const [vcardRows] = await pool.execute('SELECT * FROM registraya_vcard_registros WHERE slug = ?', ['cesar-reyes-jaramillo-eu0t']);
        console.log('VCARD DATA:');
        console.log(JSON.stringify(vcardRows, null, 2));

        const [sellerRows] = await pool.execute('SELECT * FROM registraya_vcard_sellers WHERE id = 11');
        console.log('\nSELLER DATA:');
        console.log(JSON.stringify(sellerRows, null, 2));

        await pool.end();
    } catch (err) {
        console.error('ERROR:', err);
    }
}

main();
