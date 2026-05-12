const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const dbConfig = {
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    ssl: false // StackCP suele dar problemas con SSL
};

async function setupIntelligenceDB() {
    console.log('🚀 Iniciando configuración de Inteligencia CRM...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la base de datos.');

        // 1. Modificar tabla de sesiones para estado y metadata
        console.log('--- Configurando tabla de sesiones ---');
        try {
            await connection.execute('ALTER TABLE registraya_whatsapp_sessions ADD COLUMN bot_state VARCHAR(50) DEFAULT "START"');
            console.log('  + Columna bot_state añadida.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('  - Columna bot_state ya existe.');
            else throw e;
        }

        try {
            await connection.execute('ALTER TABLE registraya_whatsapp_sessions ADD COLUMN bot_metadata JSON NULL');
            console.log('  + Columna bot_metadata añadida.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('  - Columna bot_metadata ya existe.');
            else throw e;
        }

        // 2. Crear tabla de Leads Inteligentes
        console.log('--- Creando tabla de Leads Inteligentes ---');
        const createLeadsTable = `
            CREATE TABLE IF NOT EXISTS registraya_whatsapp_leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                jid VARCHAR(50) NOT NULL,
                nombre VARCHAR(100),
                negocio VARCHAR(100),
                profesion VARCHAR(100),
                ciudad VARCHAR(100),
                canton VARCHAR(100),
                edad_propietario VARCHAR(20),
                estado_civil VARCHAR(50),
                horarios VARCHAR(100),
                potencial_web BOOLEAN DEFAULT FALSE,
                potencial_auto BOOLEAN DEFAULT FALSE,
                interes ENUM('VENTA_DIRECTA', 'RESELLER', 'UNKNOWN') DEFAULT 'UNKNOWN',
                estado_conversacion VARCHAR(50),
                puntuacion_calidad INT DEFAULT 0,
                deep_profile JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (jid),
                INDEX (interes)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;
        await connection.execute(createLeadsTable);
        console.log('✅ Tabla registraya_whatsapp_leads lista.');

        console.log('\n🌟 Base de datos preparada para el "Cerebro de Datos" v2.');

    } catch (err) {
        console.error('❌ Error durante la configuración:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

setupIntelligenceDB();
