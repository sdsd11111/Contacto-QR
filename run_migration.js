const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

async function runMigration() {
    console.log("Starting stand-alone migration...");
    console.log(`Connecting to ${dbConfig.host}:${dbConfig.port}...`);
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database.");

        const queries = [
            'ALTER TABLE registraya_vcard_registros MODIFY COLUMN foto_url LONGTEXT',
            'ALTER TABLE registraya_vcard_registros MODIFY COLUMN comprobante_url LONGTEXT',
            'ALTER TABLE registraya_vcard_registros MODIFY COLUMN portada_desktop LONGTEXT',
            'ALTER TABLE registraya_vcard_registros MODIFY COLUMN portada_movil LONGTEXT',
            'ALTER TABLE registraya_vcard_registros DROP COLUMN IF EXISTS hero_mobile_url',
            'ALTER TABLE registraya_vcard_registros DROP COLUMN IF EXISTS hero_desktop_url'
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            try {
                await connection.execute(query);
                console.log("Success.");
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log("Column already exists, skipping.");
                } else {
                    console.error(`Error executing ${query}:`, err.message);
                }
            }
        }

        await connection.end();
        console.log("Migration finished.");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

runMigration();
