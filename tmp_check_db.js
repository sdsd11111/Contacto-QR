
const mysql = require('mysql2/promise');
require('dotenv').config();

async function listMore() {
    const dbUrl = process.env.DATABASE_URL;
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = dbUrl.match(regex);
    const [, user, password, host, port, database] = match;

    const connection = await mysql.createConnection({
        host,
        user,
        password,
        database,
        port: parseInt(port)
    });

    try {
        const [rows] = await connection.execute(
            "SELECT id, nombre, nombre_negocio FROM registraya_vcard_registros LIMIT 100"
        );
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

listMore();
