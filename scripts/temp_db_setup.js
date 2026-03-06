const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Intentar cargar variables de entorno desde el directorio raíz del proyecto
const envPath = path.join(process.cwd(), '.env.local');

console.log('--- Intentando cargar env desde:', envPath);
if (fs.existsSync(envPath)) {
    console.log('✅ Archivo .env.local encontrado.');
    dotenv.config({ path: envPath });
} else {
    console.error('❌ Archivo .env.local NO encontrado. Abortando.');
    process.exit(1);
}

async function createTable() {
    console.log('--- Intentando crear tabla ventas_leads ---');
    console.log('Host:', process.env.MYSQL_HOST);
    console.log('Database:', process.env.MYSQL_DATABASE);

    if (!process.env.MYSQL_HOST) {
        console.error('❌ Error: MYSQL_HOST no está definido. Revisa tus variables de entorno.');
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectTimeout: 30000,
    });

    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS ventas_leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                celular VARCHAR(20) NOT NULL,
                ciudad VARCHAR(100) NOT NULL,
                experiencia VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await connection.execute(sql);
        console.log('✅ Tabla ventas_leads creada o ya existente.');
    } catch (err) {
        console.error('❌ Error creando la tabla:', err);
    } finally {
        await connection.end();
    }
}

createTable();
