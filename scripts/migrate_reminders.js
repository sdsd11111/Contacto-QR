const pool = require('./lib/db').default || require('./lib/db');

async function migrate() {
    try {
        console.log('Iniciando migración de base de datos...');
        
        // Agregar columna para rastrear el recordatorio de expiración de 30 días
        await pool.execute(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN IF NOT EXISTS expires_reminder_sent TINYINT(1) DEFAULT 0
        `);
        
        console.log('Columna expires_reminder_sent añadida correctamente.');
        process.exit(0);
    } catch (err) {
        console.error('Error en la migración:', err);
        process.exit(1);
    }
}

migrate();
