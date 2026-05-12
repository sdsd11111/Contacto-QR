const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function getCodesJSON() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        const [rows] = await connection.execute(
            'SELECT nombre, email, edit_code FROM registraya_vcard_registros WHERE edit_code IS NOT NULL LIMIT 5'
        );

        fs.writeFileSync('temp_codes.json', JSON.stringify(rows, null, 2));
        console.log('JSON saved to temp_codes.json');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

getCodesJSON();
