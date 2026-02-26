const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        const [rows] = await connection.execute(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}' 
             AND TABLE_NAME = 'registraya_vcard_registros'`
        );

        console.log('Columnas de registraya_vcard_registros:');
        console.log(rows.map(r => r.COLUMN_NAME).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkColumns();
