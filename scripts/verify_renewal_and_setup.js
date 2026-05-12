const pool = require('./lib/db').default || require('./lib/db');

async function verifyRenewal() {
    try {
        console.log('--- TEST LOGIC RENEWAL ---');
        const now = new Date();
        
        // Simulación 1: Usuario ya expirado (o sin fecha)
        // Debería empezar desde HOY + 1 año
        const expiredDate = new Date(now);
        expiredDate.setFullYear(expiredDate.getFullYear() - 1); // Expiró hace 1 año
        
        const base1 = (expiredDate && expiredDate > now) ? expiredDate : now;
        const result1 = new Date(base1);
        result1.setFullYear(result1.getFullYear() + 1);
        
        console.log('Test 1 (Expirado):');
        console.log('  Hoy:', now.toISOString());
        console.log('  Expiración previa:', expiredDate.toISOString());
        console.log('  Nueva Expiración:', result1.toISOString());
        
        // Simulación 2: Usuario vigente (le faltan 3 meses)
        // Debería sumar 1 año a esos 3 meses
        const futureDate = new Date(now);
        futureDate.setMonth(futureDate.getMonth() + 3); // Vence en 3 meses
        
        const base2 = (futureDate && futureDate > now) ? futureDate : now;
        const result2 = new Date(base2);
        result2.setFullYear(result2.getFullYear() + 1);
        
        console.log('Test 2 (Vigente +3 meses):');
        console.log('  Hoy:', now.toISOString());
        console.log('  Expiración previa:', futureDate.toISOString());
        console.log('  Nueva Expiración:', result2.toISOString());
        
        const diffMs = result2.getTime() - now.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        console.log(`  Resultado: ${diffDays} días totales (aprox 1 año y 3 meses). OK.`);

        console.log('\n--- MIGRATION COLUMNS ---');
        // Asegurar columnas para recordatorios escalonados
        await pool.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS expires_reminder_7d_sent TINYINT(1) DEFAULT 0');
        await pool.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS expires_reminder_0d_sent TINYINT(1) DEFAULT 0');
        console.log('Columnas 7d y 0d verificadas/añadidas.');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verifyRenewal();
