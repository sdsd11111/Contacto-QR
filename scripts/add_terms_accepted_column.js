const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        console.log("Adding terminos_aceptados_en to registraya_vcard_sellers...");
        await pool.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN terminos_aceptados_en DATETIME NULL;');
        console.log("Column added successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error(e);
        }
    } finally {
        await pool.end();
    }
}

run();
