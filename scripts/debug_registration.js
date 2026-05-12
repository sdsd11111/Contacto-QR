const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debug() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('--- ÚLTIMO REGISTRO (PAYPHONE) ---');
        const [rows] = await connection.execute(
            'SELECT id, nombre, email, status, foto_url, comprobante_url, paid_at, auto_email_sent FROM registraya_vcard_registros ORDER BY id DESC LIMIT 1'
        );
        console.log(JSON.stringify(rows[0], null, 2));

        console.log('\n--- COLA DE CORREOS (CRON) ---');
        console.log('Filtro: status = "pagado" AND auto_email_sent = 0');
        const [queue] = await connection.execute(
            'SELECT id, nombre, email, paid_at FROM registraya_vcard_registros WHERE status = "pagado" AND auto_email_sent = 0'
        );

        if (queue.length === 0) {
            console.log('No hay correos pendientes en la cola.');
        } else {
            console.table(queue.map(r => ({
                id: r.id,
                nombre: r.nombre,
                email: r.email,
                pagado_el: r.paid_at,
                "¿Listo para enviar?": r.paid_at && new Date(r.paid_at) <= new Date(Date.now() - 24 * 60 * 60 * 1000) ? "SÍ (Pasaron 24h)" : "ESPERANDO (Aún no pasan 24h)"
            })));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

debug();
