
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function migrate() {
    const dbConfig = {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    };

    console.log('Connecting to:', dbConfig.host);
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    const columns = [
        { name: 'hero_action', type: "ENUM('wifi', 'file', 'link') DEFAULT 'wifi'" },
        { name: 'hero_file_url', type: "TEXT" },
        { name: 'hero_external_link', type: "TEXT" },
        { name: 'hero_wifi_steps', type: "TEXT" }
    ];

    for (const col of columns) {
        try {
            console.log(`Adding ${col.name}...`);
            await connection.execute(`
                ALTER TABLE registraya_vcard_registros 
                ADD COLUMN ${col.name} ${col.type}
            `);
            console.log(`Successfully added ${col.name}`);
        } catch (e: any) {
            if (e.message.includes('Duplicate column name')) {
                console.log(`${col.name} already exists.`);
            } else {
                console.error(`Error adding ${col.name}:`, e.message);
            }
        }
    }

    console.log('Database migration completed.');
    await connection.end();
}

migrate().catch(console.error);
