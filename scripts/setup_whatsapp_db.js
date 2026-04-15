const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        console.log('Creating registraya_whatsapp_sessions...');
        await c.execute(`
            CREATE TABLE IF NOT EXISTS registraya_whatsapp_sessions (
                jid VARCHAR(255) PRIMARY KEY,
                last_interaction DATETIME DEFAULT NULL,
                last_human_interaction DATETIME DEFAULT NULL,
                bot_muted_until DATETIME DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('registraya_whatsapp_sessions created.');

        console.log('Creating registraya_whatsapp_messages...');
        await c.execute(`
            CREATE TABLE IF NOT EXISTS registraya_whatsapp_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                jid VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_jid (jid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('registraya_whatsapp_messages created.');

        console.log('Tables created successfully.');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await c.end();
        process.exit(0);
    }
}
createTables();
