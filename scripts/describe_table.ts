import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function describeTable() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    const [rows]: any = await db.execute('DESCRIBE registraya_vcard_registros');
    console.log(JSON.stringify(rows, null, 2));

    await db.end();
}

describeTable().catch(console.error);
