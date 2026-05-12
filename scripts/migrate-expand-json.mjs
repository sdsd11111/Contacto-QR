// Ejecutar: node scripts/migrate-expand-json.mjs
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Cargar .env.local manualmente
const env = Object.fromEntries(
    readFileSync('.env.local', 'utf-8')
        .split('\n')
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => {
            const idx = l.indexOf('=');
            return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        })
);

const pool = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: parseInt(env.MYSQL_PORT),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
});

console.log('✅ Conectado a MySQL:', env.MYSQL_HOST);

// Discover actual table names
const [tables] = await pool.query(`SHOW TABLES`);
console.log('📋 Tablas en la BD:');
tables.forEach(t => console.log(' -', Object.values(t)[0]));

const [cols] = await pool.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'registraya_vcard_registros' 
     AND COLUMN_NAME = 'json_override'`
);
console.log('📋 Tipo actual de json_override:', cols[0]?.COLUMN_TYPE);

// Run migrations
console.log('🔄 Ejecutando ALTER TABLE...');
await pool.query(`ALTER TABLE registraya_vcard_registros MODIFY COLUMN json_override MEDIUMTEXT`);
console.log('✅ json_override → MEDIUMTEXT');

await pool.query(`ALTER TABLE registraya_vcard_registros MODIFY COLUMN hero_slides_json MEDIUMTEXT`);
console.log('✅ hero_slides_json → MEDIUMTEXT');

await pool.query(`ALTER TABLE registraya_vcard_registros MODIFY COLUMN catalogo_json MEDIUMTEXT`);
console.log('✅ catalogo_json → MEDIUMTEXT');

// Verify
const [after] = await pool.query(
    `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'registraya_vcard_registros' 
     AND COLUMN_NAME IN ('json_override', 'hero_slides_json', 'catalogo_json')`
);
console.log('\n🎉 Resultado final:');
after.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.COLUMN_TYPE}`));

await pool.end();
console.log('\n✅ Migración completada exitosamente.');
