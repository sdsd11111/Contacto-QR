const fs = require('fs');
const path = require('path');
const https = require('https');
const mysql = require('mysql2/promise');
const { URL } = require('url');

// MySQL Credentials (from .env.local)
const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(true));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

function getExtension(url) {
    const pathname = new URL(url).pathname;
    return path.extname(pathname) || '.jpg';
}

async function migrateImages() {
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

            // Process Foto URL
            if (record.foto_url && record.foto_url.startsWith('http')) {
                const ext = getExtension(record.foto_url);
                const filename = `${record.id}_profile${ext}`;
                const localPath = path.join(UPLOADS_DIR, filename);
                const publicUrl = `/uploads/${filename}`;

                try {
                    console.log(`Downloading photo for ${record.nombre}...`);
                    await downloadFile(record.foto_url, localPath);
                    newFotoUrl = publicUrl;
                    updated = true;
                } catch (err) {
                    console.error(`Error downloading photo for ${record.nombre}:`, err.message);
                }
            }

            // Process Comprobante URL
            if (record.comprobante_url && record.comprobante_url.startsWith('http')) {
                const ext = getExtension(record.comprobante_url);
                const filename = `${record.id}_receipt${ext}`;
                const localPath = path.join(UPLOADS_DIR, filename);
                const publicUrl = `/uploads/${filename}`;

                try {
                    console.log(`Downloading receipt for ${record.nombre}...`);
                    await downloadFile(record.comprobante_url, localPath);
                    newComprobanteUrl = publicUrl;
                    updated = true;
                } catch (err) {
                    console.error(`Error downloading receipt for ${record.nombre}:`, err.message);
                }
            }

            if (updated) {
                await connection.execute(
                    'UPDATE registraya_vcard_registros SET foto_url = ?, comprobante_url = ? WHERE id = ?',
                    [newFotoUrl, newComprobanteUrl, record.id]
                );
                console.log(`Updated records for ${record.nombre}`);
            }
        }

        console.log('Image migration completed!');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrateImages();
