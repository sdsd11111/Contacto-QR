const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// MySQL Credentials
const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

async function migrateImagesToDB() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected! Fetching records...');

        const [rows] = await connection.execute('SELECT id, nombre, foto_url, comprobante_url FROM registraya_vcard_registros');

        console.log(`Found ${rows.length} records.`);

        for (const record of rows) {
            let updated = false;
            let newFotoUrl = record.foto_url;
            let newComprobanteUrl = record.comprobante_url;

            // Check if foto_url is a local file path (starts with /uploads/)
            if (record.foto_url && record.foto_url.startsWith('/uploads/')) {
                const filename = path.basename(record.foto_url);
                const localPath = path.join(UPLOADS_DIR, filename);

                if (fs.existsSync(localPath)) {
                    console.log(`Encoding photo for ${record.nombre}...`);
                    const bitmap = fs.readFileSync(localPath);
                    const base64 = Buffer.from(bitmap).toString('base64');
                    // Assume it is jpeg/webp based on extension, but we can genericize or check
                    const ext = path.extname(localPath).replace('.', '');
                    newFotoUrl = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
                    updated = true;
                } else {
                    console.warn(`File not found locally: ${localPath}`);
                }
            }

            // Check comprobante_url
            if (record.comprobante_url && record.comprobante_url.startsWith('/uploads/')) {
                const filename = path.basename(record.comprobante_url);
                const localPath = path.join(UPLOADS_DIR, filename);

                if (fs.existsSync(localPath)) {
                    console.log(`Encoding receipt for ${record.nombre}...`);
                    const bitmap = fs.readFileSync(localPath);
                    const base64 = Buffer.from(bitmap).toString('base64');
                    const ext = path.extname(localPath).replace('.', '');
                    newComprobanteUrl = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
                    updated = true;
                }
            }

            if (updated) {
                // Update with LONGTEXT content
                await connection.execute(
                    'UPDATE registraya_vcard_registros SET foto_url = ?, comprobante_url = ? WHERE id = ?',
                    [newFotoUrl, newComprobanteUrl, record.id]
                );
                console.log(`Updated DB for ${record.nombre}`);
            }
        }

        console.log('Migration to In-DB Storage completed!');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrateImagesToDB();
