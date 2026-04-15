const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

function generateEditCode() {
    return 'RYA-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    console.log('--- Iniciando Backfill de Códigos de Edición (con prefijo) ---');

    try {
        // Seleccionamos todos para verificar prefijo
        const [rows] = await conn.execute('SELECT id, edit_code FROM registraya_vcard_registros');

        for (const row of rows) {
            let newCode = row.edit_code;
            let needsUpdate = false;

            if (!newCode) {
                newCode = generateEditCode();
                needsUpdate = true;
            } else if (!newCode.startsWith('RYA-2026-')) {
                newCode = 'RYA-2026-' + newCode;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await conn.execute(
                    'UPDATE registraya_vcard_registros SET edit_code = ?, edit_uses_remaining = COALESCE(edit_uses_remaining, 2) WHERE id = ?',
                    [newCode, row.id]
                );
                console.log(`ID ${row.id}: Código actualizado -> ${newCode}`);
            }
        }

        console.log('--- Proceso completado con éxito ---');
    } catch (err) {
        console.error('Error durante el backfill:', err);
    } finally {
        await conn.end();
    }
}

run();
