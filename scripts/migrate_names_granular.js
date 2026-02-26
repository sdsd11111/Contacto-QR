const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
    });

    try {
        console.log('🚀 Iniciando migración de estructura de nombres...');

        // 1. Añadir columnas
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN tipo_perfil VARCHAR(20) DEFAULT 'persona',
            ADD COLUMN nombres VARCHAR(255),
            ADD COLUMN apellidos VARCHAR(255),
            ADD COLUMN nombre_negocio VARCHAR(255),
            ADD COLUMN contacto_nombre VARCHAR(255),
            ADD COLUMN contacto_apellido VARCHAR(255)
        `);
        console.log('✅ Columnas añadidas correctamente.');

        // 2. Migrar datos existentes (heurística simple para MySQL)
        // nombres = primera palabra, apellidos = el resto
        await connection.execute(`
            UPDATE registraya_vcard_registros 
            SET 
                tipo_perfil = 'persona',
                nombres = SUBSTRING_INDEX(nombre, ' ', 1),
                apellidos = IF(LOCATE(' ', nombre) > 0, SUBSTRING(nombre, LOCATE(' ', nombre) + 1), '')
            WHERE tipo_perfil = 'persona' OR tipo_perfil IS NULL
        `);
        console.log('✅ Datos existentes migrados a estructura granular.');

        console.log('✨ Migración completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await connection.end();
    }
}

migrate();
