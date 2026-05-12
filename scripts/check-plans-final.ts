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
    const [counts]: any = await connection.execute('SELECT plan, count(*) as count FROM registraya_vcard_registros GROUP BY plan');
    console.log('Plan counts:', counts);

    const [rows]: any = await connection.execute('SELECT id, nombre, plan, bio, productos_servicios FROM registraya_vcard_registros WHERE plan IN ("pro", "digital", "basic") LIMIT 10');
    console.log('Sample records:', JSON.stringify(rows, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
