import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkSellers() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    console.log('--- Vendedores Específicos (11 y 16) ---');
    const [rows]: any = await db.execute(`
        SELECT id, nombre, email 
        FROM registraya_vcard_sellers
        WHERE id IN (11, 16)
    `);

    fs.writeFileSync(path.join(__dirname, '../sellers_debug_output.json'), JSON.stringify(rows, null, 2));
    
    await db.end();
}

checkSellers().catch(console.error);
