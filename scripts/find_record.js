
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function find() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    });

    try {
        const [rows] = await connection.execute('SELECT * FROM registraya_vcard_registros WHERE slug = ?', ['activaqr-9ag4']);
        // Output to a file to avoid terminal mangling
        const fs = require('fs');
        fs.writeFileSync('output_record.json', JSON.stringify(rows[0], null, 2));
        console.log('Record written to output_record.json');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

find();
