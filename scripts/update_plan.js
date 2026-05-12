const mysql = require('mysql2/promise');
require('dotenv').config({path: '.env.local'});
async function run() {
    try {
        const pool = mysql.createPool({host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE});
        const [countRows] = await pool.query('SELECT COUNT(*) as total from registraya_vcard_registros where plan = "pro"');
        console.log('Pro count:', countRows[0].total);

        // Update them
        const [updateResult] = await pool.query('UPDATE registraya_vcard_registros SET plan = "digital" WHERE plan = "pro"');
        console.log('Updated:', updateResult.affectedRows);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
