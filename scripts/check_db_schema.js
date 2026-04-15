const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');

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

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute("DESCRIBE registraya_vcard_registros");
        const fotoUrlField = rows.find(r => r.Field === 'foto_url');
        console.log(JSON.stringify(fotoUrlField || { error: 'Field not found' }, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

main();
