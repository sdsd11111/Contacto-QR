const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function setCesarCode() {
    console.log('Connecting to MySQL...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const cesarEmail = 'objetivo.cesar@gmail.com';

        // Verificar si Cesar existe
        const [rows] = await connection.execute(
            'SELECT id, nombre, codigo FROM registraya_vcard_sellers WHERE email = ?',
            [cesarEmail]
        );

        if (rows.length === 0) {
            console.log('Cesar Reyes no encontrado. Creando con código 001...');
            const [result] = await connection.execute(
                'INSERT INTO registraya_vcard_sellers (nombre, email, password, role, codigo, activo) VALUES (?, ?, ?, ?, ?, 1)',
                ['Cesar Reyes', cesarEmail, 'cesar2026', 'seller', '001']
            );
            console.log(`Cesar Reyes creado con ID: ${result.insertId} y código: 001`);
        } else {
            const cesar = rows[0];
            console.log(`Cesar Reyes encontrado. ID: ${cesar.id}, Código actual: ${cesar.codigo}`);

            // Actualizar el código a 001
            const [updateResult] = await connection.execute(
                'UPDATE registraya_vcard_sellers SET codigo = ? WHERE email = ?',
                ['001', cesarEmail]
            );
            console.log(`Código actualizado a "001". Filas afectadas: ${updateResult.affectedRows}`);
        }

        // Verificar resultado final
        const [verify] = await connection.execute(
            'SELECT id, nombre, email, codigo, role, activo FROM registraya_vcard_sellers WHERE email = ?',
            [cesarEmail]
        );
        console.log('\n✅ Estado final de Cesar Reyes:');
        console.table(verify);

    } catch (err) {
        console.error('Error en el script:');
        console.error(err.stack);
    } finally {
        if (connection) await connection.end();
        console.log('Conexión cerrada.');
    }
}

setCesarCode();
