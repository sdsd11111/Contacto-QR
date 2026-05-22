import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration() {
    const sql = readFileSync(join(__dirname, 'migration_contratos.sql'), 'utf-8');

    // Solo extraer el CREATE TABLE
    const createMatch = sql.match(/CREATE TABLE IF NOT EXISTS contratos[\s\S]*?\)[^;]*ENGINE[^;]*;/i);
    if (!createMatch) {
        console.error('No se encontró CREATE TABLE en el migration');
        process.exit(1);
    }

    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'mysql.us.stackcp.com',
        port: Number(process.env.MYSQL_PORT || 42755),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 1,
    });

    try {
        await pool.query(createMatch[0]);
        console.log('✅ Tabla "contratos" creada correctamente');
    } catch (err) {
        console.error('❌ Error al crear tabla:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

runMigration();
