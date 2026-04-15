import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function check() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const [tables] = await connection.execute("SHOW TABLES LIKE 'registraya_whatsapp_%'");
        const names = tables.map(row => Object.values(row)[0]);
        fs.writeFileSync('scripts/tables.json', JSON.stringify(names, null, 2), 'utf8');
        console.log("Saved to scripts/tables.json");

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

check();
