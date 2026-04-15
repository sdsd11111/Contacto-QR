
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkDatabase() {
    // Manual parse of .env.local to avoid dependency issues in this environment
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            env[match[1]] = value.trim();
        }
    });

    const connection = await mysql.createConnection({
        host: env.MYSQL_HOST,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    });

    try {
        console.log('Checking for photo.com and suspicious data...');

        const [rows] = await connection.execute(
            'SELECT id, email, foto_url, comprobante_url FROM registraya_vcard_registros WHERE foto_url LIKE "%photo.com%" OR comprobante_url LIKE "%photo.com%"'
        );

        console.log(`Found ${rows.length} records with photo.com placeholders.`);
        rows.forEach(row => {
            console.log(`- ID: ${row.id}, Email: ${row.email}, Foto: ${row.foto_url}, Recibo: ${row.comprobante_url}`);
        });

        const [totalCount] = await connection.execute('SELECT COUNT(*) as total FROM registraya_vcard_registros');
        console.log(`Total records in table: ${totalCount[0].total}`);

        // Check for records with http instead of https for these domains if any
        const [mixedRows] = await connection.execute(
            'SELECT id, email, foto_url FROM registraya_vcard_registros WHERE (foto_url LIKE "http://%" AND foto_url NOT LIKE "http://localhost%")'
        );
        console.log(`Found ${mixedRows.length} records with potential mixed content (HTTP).`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkDatabase();
