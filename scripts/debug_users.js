const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkUsers() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        console.log('Searching for users...');
        const [rows] = await conn.execute(
            "SELECT id, slug, nombre, nombre_negocio, whatsapp FROM registraya_vcard_registros WHERE nombre LIKE '%Mundo Azul%' OR nombre LIKE '%Ups Detalles%' OR nombre_negocio LIKE '%Mundo Azul%' OR nombre_negocio LIKE '%Ups Detalles%' OR slug LIKE '%mundo-azul%' OR slug LIKE '%ups-detalles%'"
        );
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await conn.end();
    }
}

checkUsers();
