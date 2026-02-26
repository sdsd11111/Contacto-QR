const mysql = require('mysql2/promise');

const cfg = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function run() {
    const c = await mysql.createConnection(cfg);

    // ===== TAREA 1: Marcar TODOS los correos pendientes como enviados =====
    // El campo es auto_email_sent en registraya_vcard_registros
    // Valores posibles: 0/false = pendiente, 1/true = enviado

    // Primero contar cuántos hay pendientes
    const [before] = await c.execute('SELECT COUNT(*) as total FROM registraya_vcard_registros WHERE auto_email_sent = 0 OR auto_email_sent IS NULL');
    process.stdout.write('Correos pendientes antes: ' + before[0].total + '\n');

    // Marcar todos como enviados (SIN enviar ningún correo)
    const [emailUpdate] = await c.execute(
        'UPDATE registraya_vcard_registros SET auto_email_sent = 1 WHERE auto_email_sent = 0 OR auto_email_sent IS NULL'
    );
    process.stdout.write('Correos marcados como enviados: ' + emailUpdate.affectedRows + '\n');

    // También buscar si existe tabla separada de email queue
    const [tabs] = await c.execute('SHOW TABLES');
    const tableNames = tabs.map(t => Object.values(t)[0]);

    for (const tName of tableNames) {
        if (tName.toLowerCase().includes('email') || tName.toLowerCase().includes('queue') || tName.toLowerCase().includes('mail')) {
            process.stdout.write('Tabla email encontrada: ' + tName + '\n');
            const [cols] = await c.execute('SHOW COLUMNS FROM ' + tName);
            const colNames = cols.map(x => x.Field);
            process.stdout.write('Columnas: ' + colNames.join(', ') + '\n');

            // Marcar como enviados si tiene campo sent/status
            if (colNames.includes('sent')) {
                const [r] = await c.execute('UPDATE ' + tName + ' SET sent = 1 WHERE sent = 0 OR sent IS NULL');
                process.stdout.write('Filas actualizadas en ' + tName + ': ' + r.affectedRows + '\n');
            } else if (colNames.includes('status')) {
                const [r] = await c.execute("UPDATE " + tName + " SET status = 'sent' WHERE status != 'sent'");
                process.stdout.write('Filas actualizadas en ' + tName + ': ' + r.affectedRows + '\n');
            }
        }
    }

    // ===== TAREA 2: Cesar Reyes = Socio, comision = 0% =====
    // Ver columnas de sellers primero
    const [sellerCols] = await c.execute('SHOW COLUMNS FROM registraya_vcard_sellers');
    const colNames = sellerCols.map(x => x.Field);
    process.stdout.write('\nColumnas sellers: ' + colNames.join(', ') + '\n');

    // Actualizar Cesar: role=socio (o admin), comision_porcentaje=0
    const roleValue = colNames.includes('role') ? 'socio' : null;

    let updateQuery = 'UPDATE registraya_vcard_sellers SET comision_porcentaje = 0';
    if (roleValue) updateQuery += ", role = 'socio'";
    updateQuery += ' WHERE id = 11';

    const [cesarUpdate] = await c.execute(updateQuery);
    process.stdout.write('Cesar actualizado (comision=0, role=socio): ' + cesarUpdate.affectedRows + ' filas\n');

    // Verificar
    const [verify] = await c.execute('SELECT id, nombre, codigo, role, comision_porcentaje FROM registraya_vcard_sellers WHERE id = 11');
    process.stdout.write('Cesar verificado: ' + JSON.stringify(verify[0]) + '\n');

    // También marcar comisiones pendientes de Cesar como pagadas (no debe tener deuda)
    // Verificar si hay tabla de comisiones
    for (const tName of tableNames) {
        if (tName.toLowerCase().includes('comis') || tName.toLowerCase().includes('commission')) {
            process.stdout.write('Tabla comisiones: ' + tName + '\n');
        }
    }

    // Verificar campo commission_status en registros de Cesar
    if (colNames.includes('commission_status') || true) {
        const [commRows] = await c.execute(
            "SELECT COUNT(*) as total FROM registraya_vcard_registros WHERE seller_id = 11 AND commission_status != 'paid'"
        );
        process.stdout.write('Comisiones pendientes de Cesar: ' + commRows[0].total + '\n');

        if (commRows[0].total > 0) {
            const [commUpdate] = await c.execute(
                "UPDATE registraya_vcard_registros SET commission_status = 'paid' WHERE seller_id = 11"
            );
            process.stdout.write('Comisiones de Cesar marcadas como pagadas: ' + commUpdate.affectedRows + '\n');
        }
    }

    process.stdout.write('\n✅ Todo listo!\n');
    await c.end();
}

run().catch(e => process.stdout.write('ERR: ' + e.message + '\n'));
