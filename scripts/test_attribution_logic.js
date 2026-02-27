const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function test() {
    console.log('--- Testing Lead Attribution "Huella" ---');
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
    } catch (err) {
        console.error('Connection failed:', err);
        return;
    }

    try {
        const testPhone = '593987654321';
        const testEmail = 'test_lead_' + Date.now() + '@example.com';
        const sellerId = '11'; // Cesar Reyes

        console.log(`1. Simulating Seller logging a visit for ${testPhone}...`);
        await conn.execute(`
            INSERT INTO registraya_vcard_field_visits 
            (seller_id, business_name, contact_name, contact_phone, contact_email, business_category, result, main_objection, notes)
            VALUES (?, 'Test Business', 'Lead Name', ?, ?, 'Otros', 'seguimiento', 'None', 'Footprint test')
        `, [sellerId, testPhone, testEmail]);

        console.log('2. Simulating Client registering independently with the same phone...');
        // We'll call the API via fetch if possible, but here we'll just simulate the DB check logic as it would run in the API

        const [footprintRows] = await conn.execute(`
            SELECT seller_id 
            FROM registraya_vcard_field_visits 
            WHERE (contact_phone = ? OR (contact_email IS NOT NULL AND contact_email = ?))
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY created_at DESC 
            LIMIT 1
        `, [testPhone, testEmail]);

        console.log('Footprint found:', footprintRows);

        if (footprintRows.length > 0 && footprintRows[0].seller_id == sellerId) {
            console.log('✅ SUCCESS: Footprint correctly identifies the original seller.');
        } else {
            console.error('❌ FAILURE: Footprint not found or incorrect seller.');
        }

        // Cleanup test data
        await conn.execute('DELETE FROM registraya_vcard_field_visits WHERE contact_phone = ?', [testPhone]);
        console.log('Test data cleaned up.');

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await conn.end();
    }
}

test();
