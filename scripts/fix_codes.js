require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function fixSellerCodes() {
    const pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: process.env.MYSQL_PORT, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE });
    try {
        console.log('--- INICIANDO CORRECCIÓN DE CÓDIGOS ---');
        // Check if both columns exist
        const [columns] = await pool.execute('SHOW COLUMNS FROM registraya_vcard_sellers');
        const hasCode = columns.some(col => col.Field === 'code');
        const hasCodigo = columns.some(col => col.Field === 'codigo');

        console.log('Code exists:', hasCode);
        console.log('Codigo exists:', hasCodigo);

        if (hasCode && hasCodigo) {
            console.log('Migrando datos de "codigo" a "code"...');
            await pool.execute('UPDATE registraya_vcard_sellers SET code = codigo WHERE codigo IS NOT NULL AND code IS NULL');
            console.log('Datos transferidos exitosamente. Por favor, remueva la columna "codigo" en uso para evitar futuros problemas.');
        }

        // Final Query to show fixing
        const [rows] = await pool.execute('SELECT id, nombre, email, role, code, codigo FROM registraya_vcard_sellers ORDER BY id DESC LIMIT 5');
        console.log('--- ESTADO DE DATOS DESPUES DE MIGRAR ---');
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.log('DB_ERROR: ' + err.message);
    } finally {
        await pool.end();
    }
}
fixSellerCodes();
