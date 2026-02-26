const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function getSimpleCodes() {
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

        console.log('--- CODIGOS DISPONIBLES ---');
        rows.forEach(row => {
            console.log(`Nombre: ${row.nombre} | Email: ${row.email} | Código: ${row.edit_code}`);
        });
        console.log('---------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

getSimpleCodes();
