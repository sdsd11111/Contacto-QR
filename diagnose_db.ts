
import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function diagnose() {
    console.log('Connecting to:', process.env.MYSQL_HOST);
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0,
    });

    try {
        const connection = await pool.getConnection();
        console.log('Connected to DB');

        const results: any = {};

        // 1. Get target record
        const [targetRecord]: any = await connection.execute(
            'SELECT * FROM registraya_vcard_registros WHERE slug = ?',
            ['activaqr-9ag4']
        );
        results.targetRecord = targetRecord[0] || null;

        // 2. Find some records with SOME data to compare (be more inclusive)
        const [populatedRows]: any = await connection.execute(
            `SELECT slug, nombre, catalogo_json, youtube_video_url, etiquetas
             FROM registraya_vcard_registros
             WHERE catalogo_json IS NOT NULL
                OR youtube_video_url IS NOT NULL
                OR etiquetas IS NOT NULL
             LIMIT 10`
        );
        results.populatedRows = populatedRows;

        // 3. Get some stats
        const [stats]: any = await connection.execute(
            `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN catalogo_json IS NOT NULL THEN 1 ELSE 0 END) as with_catalog,
                SUM(CASE WHEN youtube_video_url IS NOT NULL THEN 1 ELSE 0 END) as with_video
             FROM registraya_vcard_registros`
        );
        results.stats = stats[0];

        // 4. Find records with catalog/video data (original check)
        const [populatedRecords]: any = await connection.execute(
            `SELECT id, slug, nombre, youtube_video_url, catalogo_json
             FROM registraya_vcard_registros
             WHERE (youtube_video_url IS NOT NULL AND youtube_video_url != '')
                OR (catalogo_json IS NOT NULL AND catalogo_json != '' AND catalogo_json != '[]' AND catalogo_json != '{"categories":[],"products":[]}')
             LIMIT 20`
        );
        results.populatedRecords = populatedRecords;

        // 5. Check for duplicate slugs
        const [slugDuplicates]: any = await connection.execute(
            'SELECT slug, COUNT(*) as count FROM registraya_vcard_registros GROUP BY slug HAVING count > 1'
        );
        results.slugDuplicates = slugDuplicates;

        // 4. Check for duplicate edit_codes
        const [codeDuplicates]: any = await connection.execute(`
            SELECT edit_code, COUNT(*) as count 
            FROM registraya_vcard_registros 
            WHERE edit_code IS NOT NULL AND edit_code != ''
            GROUP BY edit_code 
            HAVING count > 1
        `);
        results.codeDuplicates = codeDuplicates;

        // 5. Get column descriptions
        const [columns]: any = await connection.execute('DESCRIBE registraya_vcard_registros');
        results.columns = columns;

        fs.writeFileSync('diagnose_result_deep.json', JSON.stringify(results, null, 2));
        console.log('Results saved to diagnose_result_deep.json');

        connection.release();
    } catch (err) {
        console.error('Diagnosis failed:', err);
    } finally {
        await pool.end();
    }
}

diagnose();
