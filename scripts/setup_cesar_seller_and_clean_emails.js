const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log('Connecting to database...');
    let conn;
    try {
        // Hardcoded credentials for debugging, taking from setup_sellers_db.js which worked
        conn = await mysql.createConnection({
            host: 'mysql.us.stackcp.com',
            port: 42473,
            user: 'codigosQR-35303938ed5b',
            password: '5plnsc8lhv',
            database: 'codigosQR-35303938ed5b'
        });
        console.log('Connected to database.');
    } catch (err) {
        console.error('Failed to connect to database:', err);
        return;
    }

    try {
        console.log('--- Iniciando Configuración de Vendedor 001 y Limpieza de Correos ---');

        // 1. Asegurar Vendedor Cesar Reyes (001)
        console.log('1. Verificando vendedor Cesar Reyes (001)...');
        // Usamos 'email' como identificador único ya que 'code' no existe en la definición original
        const sellerEmail = 'cesar.reyes@objetivo.com';
        const [sellers] = await conn.execute('SELECT * FROM registraya_vcard_sellers WHERE email = ?', [sellerEmail]);

        if (sellers.length === 0) {
            // Nota: La tabla original no tiene 'code' ni 'city', usaremos 'nombre' y 'email'
            // Si necesitamos 'code' para la lógica de negocio, deberíamos haberlo agregado, 
            // pero por ahora usaremos el ID o email como referencia si es necesario, 
            // OJO: La tabla de registros usa 'seller_code'. 
            // Vamos a asumir que 'seller_code' en registros se refiere a un código que DEBERÍA estar en sellers.
            // Si la tabla sellers no tiene code, hay una discrepancia. 
            // Revisando setup_sellers_db.js, NO tiene columna 'code'.
            // Sin embargo, el requerimiento es que Cesar tenga código "001".
            // Voy a agregar la columna 'code' si no existe, para alinear con el requerimiento.

            // Agregar columna 'code' si no existe
            try {
                await conn.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN code VARCHAR(50) UNIQUE AFTER id');
                console.log('✅ Columna "code" agregada.');
            } catch (e) { }

            // Agregar columna 'city' si no existe
            try {
                await conn.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN city VARCHAR(100) AFTER role');
                console.log('✅ Columna "city" agregada.');
            } catch (e) { }

            await conn.execute(`
                INSERT INTO registraya_vcard_sellers (code, nombre, email, password, role, activo, city, created_at)
                VALUES (?, ?, ?, ?, ?, 1, 'Loja', NOW())
            `, ['001', 'Cesar Reyes', sellerEmail, 'temp123', 'admin']);
            console.log('✅ Vendedor Cesar Reyes (001) creado.');
        } else {
            // Asegurarnos que las columnas existan también en el update
            try {
                await conn.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN code VARCHAR(50) UNIQUE AFTER id');
            } catch (e) { }
            try {
                await conn.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN city VARCHAR(100) AFTER role');
            } catch (e) { }

            await conn.execute(`
                UPDATE registraya_vcard_sellers 
                SET nombre = ?, code = ?, password = ?, role = ?, activo = 1, city = ? 
                WHERE email = ?
            `, ['Cesar Reyes', '001', 'temp123', 'admin', 'Loja', sellerEmail]);
            console.log('✅ Vendedor Cesar Reyes (001) actualizado.');
        }

        // 2. Asignar ventas "Directas" (sin código o nulas) a 001
        console.log('2. Asignando ventas huérfanas a 001...');
        const [updateSellers] = await conn.execute(`
            UPDATE registraya_vcard_registros 
            SET seller_code = '001' 
            WHERE seller_code IS NULL OR seller_code = '' OR seller_code = 'DIRECTO'
        `);
        console.log(`✅ ${updateSellers.changedRows} registros asignados a Cesar Reyes (001).`);

        // 3. Limpiar Cola de Correos (Marcar todos como enviados EXCEPTO excepciones)
        console.log('3. Limpiando cola de correos...');

        // Primero, asegurémonos de que la columna email_sent existe y es booleana/entera.
        // Asumimos que 1 = enviado, 0 = pendiente.

        const exceptions = ['samirr raiz', 'Abdanal Surinzae'];
        const placeholders = exceptions.map(() => '?').join(',');

        // Marcar TOODOS como enviados primero (para limpiar lo viejo)
        // PERO excluyendo los nombres específicos
        const query = `
            UPDATE registraya_vcard_registros 
            SET email_sent = 1 
            WHERE (email_sent = 0 OR email_sent IS NULL)
            AND name NOT IN (${placeholders?.length ? placeholders : "''"})
        `;

        const [emailUpdate] = await conn.execute(query, exceptions);
        console.log(`✅ ${emailUpdate.changedRows} correos marcados como ENVIADOS (Limpieza de cola).`);

        // Verificar el estado de las excepciones
        const [pending] = await conn.execute(`
            SELECT name, email, email_sent 
            FROM registraya_vcard_registros 
            WHERE email_sent = 0 OR email_sent IS NULL
        `);

        console.log('\n--- Cola de Correos Actual (Pendientes) ---');
        if (pending.length > 0) {
            console.table(pending);
        } else {
            console.log('La cola está vacía (0 pendientes).');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await conn.end();
    }
}

run();
