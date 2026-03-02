const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    const columns = [
        { name: 'youtube', def: 'TEXT' },
        { name: 'x', def: 'TEXT' },
        { name: 'menu_digital', def: 'TEXT' },
        { name: 'tipo_perfil', def: "VARCHAR(20) DEFAULT 'persona'" },
        { name: 'nombres', def: 'TEXT' },
        { name: 'apellidos', def: 'TEXT' },
        { name: 'nombre_negocio', def: 'TEXT' },
        { name: 'contacto_nombre', def: 'TEXT' },
        { name: 'contacto_apellido', def: 'TEXT' },
        { name: 'payment_method', def: "VARCHAR(50) DEFAULT 'transfer'" },
    ];

    try {
        // Get existing columns
        const [rows] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}' AND TABLE_NAME = 'registraya_vcard_registros'`
        );
        const existing = rows.map(r => r.COLUMN_NAME.toLowerCase());
        console.log('Existing columns:', existing);

        for (const col of columns) {
            if (existing.includes(col.name.toLowerCase())) {
                console.log(`  SKIP: '${col.name}' already exists.`);
            } else {
                await connection.execute(`ALTER TABLE registraya_vcard_registros ADD COLUMN ${col.name} ${col.def}`);
                console.log(`  ADDED: '${col.name}'`);
            }
        }

        console.log('\nMigration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
