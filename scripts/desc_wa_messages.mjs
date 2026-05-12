import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';

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

        const [desc] = await connection.execute("DESCRIBE registraya_whatsapp_messages");
        console.log("SCHEMA registraya_whatsapp_messages:");
        console.table(desc);

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

check();
