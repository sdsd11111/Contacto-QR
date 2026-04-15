import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });
        const [rows]: any = await pool.execute('DESCRIBE registraya_vcard_registros');
        const fields = rows.map((r: any) => r.Field);
        console.log('FIELDS:', fields.join(', '));
        
        const heroFields = fields.filter((f: string) => f.startsWith('hero_'));
        console.log('HERO FIELDS:', heroFields.join(', '));
    } catch (err) {
        console.error(err);
    }
}

run();
