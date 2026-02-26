
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Checking for photo.com in database...');

        const [rows] = await connection.execute(
            'SELECT id, email, foto_url, comprobante_url FROM registraya_vcard_registros WHERE foto_url LIKE "%photo.com%" OR comprobante_url LIKE "%photo.com%"'
        );

        console.log(`Found ${rows.length} records with photo.com placeholders.`);
        rows.forEach(row => {
            console.log(`- ID: ${row.id}, Email: ${row.email}, Foto: ${row.foto_url}, Recibo: ${row.comprobante_url}`);
        });

        const [count] = await connection.execute('SELECT COUNT(*) as total FROM registraya_vcard_registros');
        console.log(`Total records in table: ${count[0].total}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkDatabase();
