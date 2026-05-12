
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkBasicRecords() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [rows] = await connection.execute(
            'SELECT id, nombre, plan, productos_servicios, etiquetas FROM registraya_vcard_registros WHERE plan = "basic" OR plan IS NULL LIMIT 20'
        );
        console.log('Records with plan basic or NULL:');
        rows.forEach((r) => {
            console.log(`ID: ${r.id}, Name: ${r.nombre}, Plan: ${r.plan}, Prod: ${r.productos_servicios ? 'YES' : 'NO'}, Tags: ${r.etiquetas ? 'YES' : 'NO'}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

checkBasicRecords();
