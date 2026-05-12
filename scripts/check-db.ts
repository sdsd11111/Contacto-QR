import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkRecords() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows]: any = await connection.execute('SELECT id, nombre, plan FROM registraya_vcard_registros ORDER BY id DESC LIMIT 10');
    console.log(JSON.stringify(rows, null, 2));
    
    const [distinctPlans]: any = await connection.execute('SELECT DISTINCT plan FROM registraya_vcard_registros');
    console.log('Distinct plans:', JSON.stringify(distinctPlans, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkRecords();
