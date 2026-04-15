const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
    });

    try {
        console.log('Connecting to MySQL...');
        await pool.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN IF NOT EXISTS codigo VARCHAR(10) UNIQUE AFTER nombre');
        console.log('Column "codigo" added (or already exists).');

        // Get all sellers to assign sequential codes
        const [sellers] = await pool.execute('SELECT id, nombre FROM registraya_vcard_sellers ORDER BY created_at ASC');
        const sellerList = sellers;

        for (let i = 0; i < sellerList.length; i++) {
            const code = (i + 1).toString().padStart(3, '0'); // 001, 002, etc.
            await pool.execute('UPDATE registraya_vcard_sellers SET codigo = ? WHERE id = ?', [code, sellerList[i].id]);
            console.log(`Assigned code ${code} to ${sellerList[i].nombre}`);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
