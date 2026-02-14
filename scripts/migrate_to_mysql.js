const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// MySQL Credentials (from .env.local)
const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function migrate() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        // 1. Create Table
        console.log('Creating table if not exists...');
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS registraya_vcard_registros (
                id VARCHAR(36) PRIMARY KEY,
                slug VARCHAR(255) UNIQUE,
                created_at DATETIME,
                nombre VARCHAR(255),
                whatsapp VARCHAR(50),
                email VARCHAR(255),
                profesion VARCHAR(255),
                empresa VARCHAR(255),
                bio TEXT,
                etiquetas TEXT,
                plan VARCHAR(50),
                foto_url TEXT,
                comprobante_url TEXT,
                status VARCHAR(50),
                delivery_deadline DATETIME,
                direccion TEXT,
                web TEXT,
                instagram TEXT,
                linkedin TEXT,
                galeria_urls JSON,
                facebook TEXT,
                tiktok TEXT,
                productos_servicios TEXT,
                google_business TEXT,
                -- New fields for Reseller System
                seller_id INT NULL,
                commission_status VARCHAR(50) DEFAULT 'pending'
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;
        await connection.execute(createTableQuery);
        console.log('Table created or already exists.');

        // 2. Read Backup Data
        const backupPath = path.join(__dirname, '..', 'backup_supabase_data.json');
        const rawData = fs.readFileSync(backupPath, 'utf-8');
        const records = JSON.parse(rawData);
        console.log(`Found ${records.length} records to migrate.`);

        // 3. Insert Data
        for (const record of records) {
            // Check if exists to avoid duplicates
            const [rows] = await connection.execute('SELECT id FROM registraya_vcard_registros WHERE id = ?', [record.id]);
            if (rows.length > 0) {
                console.log(`Skipping existing record: ${record.nombre} (${record.id})`);
                continue;
            }

            // Prepare values
            // Convert ISO dates to MySQL Format (YYYY-MM-DD HH:MM:SS)
            const createdAt = new Date(record.created_at).toISOString().slice(0, 19).replace('T', ' ');
            const deliveryDeadline = record.delivery_deadline ? new Date(record.delivery_deadline).toISOString().slice(0, 19).replace('T', ' ') : null;

            // Ensure galeria_urls is a JSON string
            const galeriaUrls = JSON.stringify(record.galeria_urls || []);

            const query = `
                INSERT INTO registraya_vcard_registros (
                    id, slug, created_at, nombre, whatsapp, email, profesion, empresa, bio, etiquetas,
                    plan, foto_url, comprobante_url, status, delivery_deadline, direccion, web,
                    instagram, linkedin, galeria_urls, facebook, tiktok, productos_servicios, google_business
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                record.id,
                record.slug,
                createdAt,
                record.nombre,
                record.whatsapp,
                record.email,
                record.profesion,
                record.empresa,
                record.bio,
                record.etiquetas,
                record.plan,
                record.foto_url,
                record.comprobante_url,
                record.status,
                deliveryDeadline,
                record.direccion,
                record.web,
                record.instagram,
                record.linkedin,
                galeriaUrls,
                record.facebook,
                record.tiktok,
                record.productos_servicios,
                record.google_business
            ];

            try {
                await connection.execute(query, values);
                console.log(`Imported: ${record.nombre}`);
            } catch (err) {
                console.error(`Failed to import ${record.id}:`, err.message);
            }
        }

        console.log('Migration completed!');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
