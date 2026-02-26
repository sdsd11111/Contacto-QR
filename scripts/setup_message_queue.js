const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
        const key = line.substring(0, eqIdx).trim();
        const value = line.substring(eqIdx + 1).trim();
        env[key] = value;
    }
});

(async () => {
    const connection = await mysql.createConnection({
        host: env.MYSQL_HOST,
        port: Number(env.MYSQL_PORT || 3306),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        ssl: false
    });
    try {
        await connection.execute('DROP TABLE IF EXISTS registraya_whatsapp_message_queue');
        const createSQL = [
            'CREATE TABLE registraya_whatsapp_message_queue (',
            '  id INT AUTO_INCREMENT PRIMARY KEY,',
            '  jid VARCHAR(50) NOT NULL,',
            '  combined_content TEXT NOT NULL,',
            '  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,',
            '  processed TINYINT(1) DEFAULT 0,',
            '  INDEX idx_jid (jid),',
            '  INDEX idx_processed (processed),',
            '  INDEX idx_created_at (created_at)',
            ')'
        ].join(' ');
        await connection.execute(createSQL);
        console.log('✅ Tabla registraya_whatsapp_message_queue reconstruida correctamente.');
        const [rows] = await connection.execute('DESCRIBE registraya_whatsapp_message_queue');
        console.log('📋 Estructura:', rows.map(r => r.Field).join(', '));
    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await connection.end();
    }
})();
