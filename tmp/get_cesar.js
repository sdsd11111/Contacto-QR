const mysql = require('mysql2/promise');
require('dotenv').config();

async function getCesar() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute('SELECT * FROM registraya_vcard_sellers WHERE id = 11 OR nombre LIKE "%Cesar%"');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

getCesar();
