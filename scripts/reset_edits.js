const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function resetEdits() {
    const email = 'cristhopheryeah113@gmail.com';
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
    });

    try {
        const [result] = await connection.execute(
            'UPDATE registraya_vcard_registros SET edit_uses_remaining = 2 WHERE email = ?',
            [email]
        );

        if (result.affectedRows > 0) {
            console.log(`✅ Éxito: Se han asignado 2 intentos de edición para: ${email}`);
        } else {
            console.log(`❌ Error: No se encontró ningún registro con el email: ${email}`);
        }
    } catch (error) {
        console.error('❌ Error en la base de datos:', error);
    } finally {
        await connection.end();
    }
}

resetEdits();
