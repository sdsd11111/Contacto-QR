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
        const query = `
            SELECT 
                r.id, r.slug, r.nombre, r.email, r.last_edited_at,
                s.nombre as sold_by_name, 
                s.codigo as sold_by_code
            FROM registraya_vcard_registros r
            LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
            WHERE r.nombre LIKE ? OR r.slug LIKE ?
            ORDER BY r.created_at DESC
        `;
        const params = ['%Paula%', '%paula%'];
        
        const [rows] = await connection.execute(query, params);
        console.log('Admin search results for "Paula":');
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

main();
