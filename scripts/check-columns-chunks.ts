import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows]: any = await connection.execute('SHOW COLUMNS FROM registraya_vcard_registros');
    const columns = rows.map((r: any) => r.Field);
    console.log('Columns count:', columns.length);
    for (let i = 0; i < columns.length; i += 10) {
        console.log(`Chunk ${i}:`, columns.slice(i, i + 10).join(', '));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
