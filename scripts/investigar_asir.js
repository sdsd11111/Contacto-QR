const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'mysql.us.stackcp.com',
    port: 42473,
    user: 'codigosQR-35303938ed5b',
    password: '5plnsc8lhv',
    database: 'codigosQR-35303938ed5b'
};

async function investigar() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado!\n');

        // 1. Ver todos los sellers
        const [sellers] = await connection.execute(
            'SELECT id, nombre, email, codigo, activo FROM registraya_vcard_sellers ORDER BY id ASC'
        );
        console.log('=== TODOS LOS SELLERS ===');
        console.table(sellers);

        // 2. Ver columnas de registros
        const [columns] = await connection.execute('SHOW COLUMNS FROM registraya_vcard_registros');
        const colNames = columns.map(c => c.Field);
        console.log('\nColumnas en registraya_vcard_registros:', colNames.join(', '));

        // 3. Ver registros con campo vendedor si existe
        if (colNames.includes('vendedor')) {
            const [byVendedor] = await connection.execute(
                'SELECT id, nombre, email, vendedor, seller_id, status FROM registraya_vcard_registros ORDER BY id ASC LIMIT 50'
            );
            console.log('\n=== REGISTROS (con campo vendedor) ===');
            console.table(byVendedor);
        } else {
            // Ver registros con seller_id
            const [registros] = await connection.execute(
                'SELECT id, nombre, email, seller_id, status FROM registraya_vcard_registros ORDER BY id ASC LIMIT 50'
            );
            console.log('\n=== REGISTROS ===');
            console.table(registros);
        }

        // 4. Contar ventas por seller
        const [countBySeller] = await connection.execute(
            `SELECT s.nombre, s.codigo, COUNT(r.id) as total_ventas 
             FROM registraya_vcard_sellers s 
             LEFT JOIN registraya_vcard_registros r ON s.id = r.seller_id 
             GROUP BY s.id, s.nombre, s.codigo ORDER BY s.id`
        );
        console.log('\n=== VENTAS POR SELLER ===');
        console.table(countBySeller);

        // 5. Buscar Asir específicamente
        const asir = sellers.find(s => s.nombre && s.nombre.toLowerCase().includes('asir'));
        if (asir) {
            console.log(`\nAsir encontrado: ID=${asir.id}, Código=${asir.codigo}`);
            const [asirSales] = await connection.execute(
                'SELECT id, nombre, email, seller_id, status FROM registraya_vcard_registros WHERE seller_id = ?',
                [asir.id]
            );
            console.log(`Ventas actuales de Asir (${asirSales.length}):`);
            console.table(asirSales);
        } else {
            console.log('\n⚠️  No se encontró Asir en sellers!');
        }

    } catch (err) {
        console.error('Error:', err.stack);
    } finally {
        if (connection) await connection.end();
    }
}

investigar();
