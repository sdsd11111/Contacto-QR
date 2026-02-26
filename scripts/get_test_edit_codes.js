const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function getTestEditCodes() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        const [rows] = await connection.execute(
            'SELECT nombre, email, edit_code, edit_uses_remaining FROM registraya_vcard_registros WHERE edit_code IS NOT NULL LIMIT 5'
        );

        console.log('📋 Códigos de Edición de Prueba:');
        console.table(rows);

    } catch (error) {
        console.error('Error fetching codes:', error);
    } finally {
        await connection.end();
    }
}

getTestEditCodes();
