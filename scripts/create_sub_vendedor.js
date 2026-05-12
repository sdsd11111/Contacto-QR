const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log('Connecting to database...');
    const conn = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 42473,
        user: 'codigosQR-35303938ed5b',
        password: '5plnsc8lhv',
        database: 'codigosQR-35303938ed5b'
    });

    try {
        console.log('--- Creando Sub-vendedor de Prueba ---');

        const parentId = 11; // Cesar Reyes (puedes cambiarlo al ID de Abel si es otro)
        const subName = 'Asesor ActivaQR';
        const subEmail = 'asesor.demo@activaqr.com';
        const subPass = 'demo123';
        const subCode = '001-B';

        // Verificar si existe parent_id
        const [parent] = await conn.execute('SELECT id FROM registraya_vcard_sellers WHERE id = ?', [parentId]);
        if (parent.length === 0) {
            console.error(`Error: El vendedor padre con ID ${parentId} no existe.`);
            return;
        }

        // Insertar sub-vendedor
        const [res] = await conn.execute(`
            INSERT INTO registraya_vcard_sellers (parent_id, nombre, email, password, role, comision_porcentaje, code, activo)
            VALUES (?, ?, ?, ?, 'seller', 30, ?, 1)
        `, [parentId, subName, subEmail, subPass, subCode]);

        console.log(`✅ Sub-vendedor creado con ID: ${res.insertId}`);
        console.log(`👤 Nombre: ${subName}`);
        console.log(`📧 Email: ${subEmail}`);
        console.log(`🔑 Pass: ${subPass}`);
        console.log(`🔗 Bajo el Líder ID: ${parentId}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await conn.end();
    }
}

run();
