const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function findCode() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        const email = 'cristhopheryeah113@gmail.com';
        const [rows] = await connection.execute(
            'SELECT nombre, email, edit_code FROM registraya_vcard_registros WHERE email = ?',
            [email]
        );

        if (rows.length > 0) {
            console.log('✅ Encontrado:');
            console.log(`Nombre: ${rows[0].nombre}`);
            console.log(`Código: ${rows[0].edit_code}`);
        } else {
            console.log('❌ No encontrado ese email.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

findCode();
