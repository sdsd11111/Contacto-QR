const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        console.log('Verifying Filtering Logic (matchesSeller)...');

        // Let's find a parent seller (e.g., Asir Deber) and verify we can find their children's sales
        const [parents] = await c.execute(`
            SELECT id, nombre, codigo FROM registraya_vcard_sellers 
            WHERE nombre LIKE '%Asir Deber%'
            LIMIT 1
        `);

        if (parents.length > 0) {
            const parent = parents[0];
            console.log(`Testing with Parent Seller: ${parent.nombre} (ID: ${parent.id})`);

            const [sales] = await c.execute(`
                SELECT r.id, r.seller_id, s.parent_id, s.nombre as seller_name
                FROM registraya_vcard_registros r
                LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
                WHERE r.seller_id = ? OR s.parent_id = ?
                LIMIT 5
            `, [parent.id, parent.id]);

            console.log('Sample Sales for this Parent (Direct + Team):');
            console.table(sales);

            // Check counts
            const [counts] = await c.execute(`
                SELECT 
                    SUM(CASE WHEN r.seller_id = ? THEN 1 ELSE 0 END) as direct_sales,
                    SUM(CASE WHEN s.parent_id = ? THEN 1 ELSE 0 END) as team_sales,
                    COUNT(*) as total_sales
                FROM registraya_vcard_registros r
                LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
                WHERE r.seller_id = ? OR s.parent_id = ?
            `, [parent.id, parent.id, parent.id, parent.id]);

            console.log('Sales Breakdown:', counts[0]);
        } else {
            console.log('No parent sellers found with sub-sellers.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

check();
