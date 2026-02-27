const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function test() {
    let conn;
    try {
        console.log("Connecting...");
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectTimeout: 10000
        });

        const testPhone = '0987654321';
        const testEmail = 'test_huella@example.com';
        const sellerId = 11; // Identified from check_last_commissions

        console.log(`Creating test visit for ${testPhone}...`);

        const insertVisitQuery = `
            INSERT INTO registraya_vcard_field_visits (
                seller_id, business_name, contact_name, 
                contact_phone, contact_email,
                business_category, 
                result, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await conn.execute(insertVisitQuery, [
            sellerId,
            'Empresa de Prueba',
            'Ciudadano de Prueba',
            testPhone,
            testEmail,
            'otro',
            'seguimiento'
        ]);

        console.log("Test visit created.");

        // Now check if it's found
        console.log("\n--- SIMULATING HUELLA CHECK ---");

        // This logic is what counts
        const query = `
            SELECT s.nombre as seller_name, v.created_at
            FROM registraya_vcard_field_visits v
            JOIN registraya_vcard_sellers s ON v.seller_id = s.id
            WHERE (v.contact_phone = ? OR (v.contact_email IS NOT NULL AND v.contact_email = ?))
              AND v.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY v.created_at DESC
            LIMIT 1
        `;

        // Test with raw phone (what RecorridoTab sends)
        const [resRaw] = await conn.execute(query, [testPhone, 'NOMATCH@example.com']);
        console.log(`Search with RAW phone (${testPhone}):`, resRaw.length > 0 ? "FOUND ✅" : "NOT FOUND ❌");

        // Test with formatted phone (what check-footprint/route.ts sends)
        const formatted = '+593 987654321';
        const [resFormatted] = await conn.execute(query, [formatted, 'NOMATCH@example.com']);
        console.log(`Search with FORMATTED phone (${formatted}):`, resFormatted.length > 0 ? "FOUND ✅" : "NOT FOUND ❌");

        if (resRaw.length > 0 && resFormatted.length === 0) {
            console.log("\n⚠️ ISSUE CONFIRMED: The footprint system works if the phone is NOT formatted, but the API formats it.");
        } else if (resRaw.length > 0 && resFormatted.length > 0) {
            console.log("\n✅ SURPRISE: Both matched. Maybe the DB has some smart matching or my script logic is flawed?");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) await conn.end();
    }
}

test();
