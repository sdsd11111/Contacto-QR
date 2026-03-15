const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [columns] = await connection.execute("SHOW COLUMNS FROM registraya_vcard_registros");
        const col = columns.find(c => c.Field === 'catalogo_json');
        console.log('--- COLUMN SCHEMA ---');
        console.log(col);

        const [rows] = await connection.execute('SELECT LENGTH(catalogo_json) as len FROM registraya_vcard_registros WHERE slug = ?', ['activaqr-9ag4']);
        console.log('--- DATA LENGTH ---');
        console.log(rows[0]);
        
        const [fullRow] = await connection.execute('SELECT catalogo_json FROM registraya_vcard_registros WHERE slug = ?', ['activaqr-9ag4']);
        const val = fullRow[0].catalogo_json;
        if (val) {
            console.log('--- JSON PREVIEW ---');
            console.log(val.substring(0, 100) + '...');
            console.log('... ' + val.substring(val.length - 100));
            try {
                JSON.parse(val);
                console.log('RESULT: JSON IS VALID');
            } catch (e) {
                console.log('RESULT: JSON IS INVALID - ' + e.message);
            }
        } else {
            console.log('RESULT: VALUE IS NULL');
        }

    } finally {
        await connection.end();
    }
}

check().catch(console.error);
