const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function fixCesar() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!\n');

        // 1. Ver todos los Cesar Reyes
        const [allCesar] = await connection.execute(
            "SELECT id, nombre, email, codigo, role, activo, created_at FROM registraya_vcard_sellers WHERE nombre LIKE '%Cesar%' OR email LIKE '%cesar%' ORDER BY id ASC"
        );
        console.log('=== Todos los registros de Cesar ===');
        console.table(allCesar);

        if (allCesar.length < 1) {
            console.log('No se encontró ningún Cesar Reyes.');
            return;
        }

        // 2. Decidir cuál conservar: el más antiguo (menor ID) con email cesar@registrameya.com
        // Primero intentar con email, si no hay, tomar el primero
        let keepRecord = allCesar.find(r => r.email === 'objetivo.cesar@gmail.com') || allCesar[0];
        const deleteRecords = allCesar.filter(r => r.id !== keepRecord.id);

        console.log(`\n→ Conservar: ID=${keepRecord.id} (${keepRecord.nombre} / ${keepRecord.email})`);
        deleteRecords.forEach(r => console.log(`→ Eliminar:  ID=${r.id} (${r.nombre} / ${r.email})`));

        // 3. Actualizar código del que conservamos a "001"
        await connection.execute(
            'UPDATE registraya_vcard_sellers SET codigo = ?, nombre = ?, activo = 1 WHERE id = ?',
            ['001', 'Cesar Reyes', keepRecord.id]
        );
        console.log(`\n✅ Código 001 asignado al ID=${keepRecord.id}`);

        // 4. Reasignar ventas de los duplicados al que conservamos
        for (const dup of deleteRecords) {
            const [reassign] = await connection.execute(
                'UPDATE registraya_vcard_registros SET seller_id = ? WHERE seller_id = ?',
                [keepRecord.id, dup.id]
            );
            console.log(`   Reasignadas ${reassign.affectedRows} ventas del duplicado ID=${dup.id} → ID=${keepRecord.id}`);

            // Eliminar el duplicado
            await connection.execute('DELETE FROM registraya_vcard_sellers WHERE id = ?', [dup.id]);
            console.log(`   Duplicado ID=${dup.id} eliminado.`);
        }

        // 5. Asignar registros "Directo" (seller_id NULL o seller_code='directo') a Cesar
        // Asignar los que no tienen vendedor asignado
        const [nullUpdate] = await connection.execute(
            'UPDATE registraya_vcard_registros SET seller_id = ? WHERE seller_id IS NULL',
            [keepRecord.id]
        );
        console.log(`\n✅ ${nullUpdate.affectedRows} registros sin vendedor asignados a Cesar Reyes`);

        // También buscar si hay un campo seller_name = 'directo' o similar
        const [columns] = await connection.execute("SHOW COLUMNS FROM registraya_vcard_registros");
        const colNames = columns.map(c => c.Field);
        console.log('\nColumnas en registraya_vcard_registros:', colNames.join(', '));

        // Si existe columna vendedor o seller_source = 'directo'
        if (colNames.includes('vendedor')) {
            const [directoUpdate] = await connection.execute(
                "UPDATE registraya_vcard_registros SET seller_id = ? WHERE (vendedor = 'Directo' OR vendedor = 'directo') AND seller_id != ?",
                [keepRecord.id, keepRecord.id]
            );
            console.log(`✅ ${directoUpdate.affectedRows} registros con vendedor='Directo' reasignados a Cesar Reyes`);
        }

        // 6. Verificación final
        console.log('\n=== VERIFICACIÓN FINAL ===');
        const [finalSellers] = await connection.execute(
            "SELECT id, nombre, email, codigo, activo FROM registraya_vcard_sellers WHERE nombre LIKE '%Cesar%' OR email LIKE '%cesar%'"
        );
        console.log('Sellers de Cesar:');
        console.table(finalSellers);

        const [finalSales] = await connection.execute(
            'SELECT COUNT(*) as total FROM registraya_vcard_registros WHERE seller_id = ?',
            [keepRecord.id]
        );
        console.log(`Total ventas asignadas a Cesar Reyes (ID=${keepRecord.id}): ${finalSales[0].total}`);

    } catch (err) {
        console.error('Error:', err.stack);
    } finally {
        if (connection) await connection.end();
        console.log('\nConexión cerrada.');
    }
}

fixCesar();
