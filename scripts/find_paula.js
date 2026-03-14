const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables manually if needed
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envConfig = dotenv.parse(envFile);

async function main() {
    const dbConfig = {
        host: envConfig.MYSQL_HOST,
        port: Number(envConfig.MYSQL_PORT),
        user: envConfig.MYSQL_USER,
        password: envConfig.MYSQL_PASSWORD,
        database: envConfig.MYSQL_DATABASE,
    };

    console.log('Connecting to database with config:', { ...dbConfig, password: '***' });

    const connection = await mysql.createConnection(dbConfig);
    try {
        const query = 'SELECT * FROM registraya_vcard_registros WHERE nombre LIKE ? OR slug LIKE ? OR empresa LIKE ? OR nombre_negocio LIKE ?';
        const params = ['%Paula%', '%paula%', '%bakery%', '%bakery%'];
        console.log('Executing query:', query, params);
        
        const [rows] = await connection.execute(query, params);
        console.log('Found rows:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
