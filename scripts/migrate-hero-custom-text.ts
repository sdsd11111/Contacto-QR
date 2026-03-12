import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    console.log('Migrando campos de texto personalizados para pasos del Hero...');

    try {
        // Añadir columnas para personalización de pasos
        await connection.query(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN IF NOT EXISTS hero_section_title VARCHAR(255) DEFAULT 'Oferta del Hero',
            ADD COLUMN IF NOT EXISTS hero_step1_title VARCHAR(255) DEFAULT 'Descarga Nuestro Contacto',
            ADD COLUMN IF NOT EXISTS hero_step2_title VARCHAR(255) DEFAULT 'Asegurate de importar el contacto',
            ADD COLUMN IF NOT EXISTS hero_step2_text TEXT,
            ADD COLUMN IF NOT EXISTS hero_step3_title VARCHAR(255) DEFAULT 'Conéctate a la Red',
            ADD COLUMN IF NOT EXISTS hero_step3_text TEXT
        `);

        // Establecer valores por defecto para registros existentes si es necesario
        // (Aunque DEFAULT ya lo hace para las columnas VARCHAR)
        
        console.log('Migración completada exitosamente.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await connection.end();
    }
}

migrate();
