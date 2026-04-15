import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function checkTables() {
    let connection;
    try {
        console.log(`Conectando a BD: ${process.env.MYSQL_DATABASE} en ${process.env.MYSQL_HOST}`);
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const [tables] = await connection.execute('SHOW TABLES');
        console.log("Tablas disponibles:");
        tables.forEach(t => console.log(Object.values(t)[0]));

    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

checkTables();
