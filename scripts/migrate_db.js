/**
 * migrate_db.js
 * Migra TODAS las tablas y datos de la DB antigua a la nueva DB ActivaQR.
 * Preserva slugs, índices, constraints y todos los datos.
 */

const mysql = require('mysql2/promise');

const OLD_DB = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b',
    connectTimeout: 15000,
};

const NEW_DB = {
    host: 'mysql.us.stackcp.com',
    port: 42755,
    user: 'Activaqrbasededatos-35303936889f',
    password: 'pwye546gfr',
    database: 'Activaqrbasededatos-35303936889f',
    connectTimeout: 15000,
};

async function migrate() {
    console.log('🔌 Conectando a bases de datos...');
    const oldConn = await mysql.createConnection({ ...OLD_DB, multipleStatements: true });
    const newConn = await mysql.createConnection({ ...NEW_DB, multipleStatements: true });
    console.log('✅ Conectado a ambas bases de datos.\n');

    try {
        // 1. Obtener lista de tablas de la DB antigua
        const [tables] = await oldConn.query('SHOW TABLES');
        const tableKey = `Tables_in_${OLD_DB.database}`;
        const tableNames = tables.map(r => r[tableKey]);
        console.log(`📋 Tablas encontradas en DB antigua (${tableNames.length}):`);
        tableNames.forEach(t => console.log(`   - ${t}`));
        console.log('');

        // 2. Deshabilitar foreign key checks en la nueva DB
        await newConn.query('SET FOREIGN_KEY_CHECKS = 0');
        await newConn.query('SET UNIQUE_CHECKS = 0');
        await newConn.query("SET SESSION sql_mode = ''");

        // 3. Para cada tabla: crear estructura + copiar datos
        for (const tableName of tableNames) {
            console.log(`\n⚙️  Migrando tabla: ${tableName}`);

            // Obtener CREATE TABLE
            const [[createRow]] = await oldConn.query(`SHOW CREATE TABLE \`${tableName}\``);
            const createSQL = createRow['Create Table'];

            // Eliminar tabla si ya existe en nueva DB y recrearla
            await newConn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            await newConn.query(createSQL);
            console.log(`   ✅ Estructura creada`);

            // Obtener todos los datos
            const [rows] = await oldConn.query(`SELECT * FROM \`${tableName}\``);
            console.log(`   📦 Filas a migrar: ${rows.length}`);

            if (rows.length === 0) {
                console.log(`   ⏭️  Tabla vacía, saltando datos`);
                continue;
            }

            // Insertar en lotes de 100
            const BATCH = 100;
            const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');

            for (let i = 0; i < rows.length; i += BATCH) {
                const batch = rows.slice(i, i + BATCH);
                const placeholders = batch.map(row => `(${Object.values(row).map(() => '?').join(', ')})`).join(', ');
                const values = batch.flatMap(row => Object.values(row).map(v => v === undefined ? null : v));
                await newConn.query(
                    `INSERT INTO \`${tableName}\` (${columns}) VALUES ${placeholders}`,
                    values
                );
            }
            console.log(`   ✅ Datos migrados correctamente`);
        }

        // 4. Rehabilitar checks
        await newConn.query('SET FOREIGN_KEY_CHECKS = 1');
        await newConn.query('SET UNIQUE_CHECKS = 1');

        // 5. Verificación final
        console.log('\n\n🔍 VERIFICACIÓN FINAL:');
        console.log('═'.repeat(60));
        const [newTables] = await newConn.query('SHOW TABLES');
        const newTableKey = `Tables_in_${NEW_DB.database}`;

        for (const tableName of tableNames) {
            const [[{ count: oldCount }]] = await oldConn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            const [[{ count: newCount }]] = await newConn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            const match = oldCount === newCount ? '✅' : '❌';
            console.log(`${match} ${tableName.padEnd(35)} OLD: ${String(oldCount).padStart(5)} filas | NEW: ${String(newCount).padStart(5)} filas`);
        }

        console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');

    } finally {
        await oldConn.end();
        await newConn.end();
        console.log('\n🔌 Conexiones cerradas.');
    }
}

migrate().catch(err => {
    console.error('\n💥 ERROR FATAL:', err.message);
    process.exit(1);
});
