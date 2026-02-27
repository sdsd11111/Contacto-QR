const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function verify() {
    let conn;
    try {
        console.log("Connecting...");
        conn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        console.log("Checking for recent visits...");
        const [visits] = await conn.execute('SELECT id, seller_id, contact_name, contact_phone, created_at FROM registraya_vcard_field_visits WHERE contact_phone IS NOT NULL ORDER BY created_at DESC LIMIT 5');

        if (visits.length === 0) {
            console.log("No visits with phone found in the database.");
            return;
        }

        const testVisit = visits[0];
        console.log('Test Visit Phone (DB):', testVisit.contact_phone);

        // Simulate formatPhoneEcuador (copy-pasted logic to avoid import issues in script)
        function formatPhone(phone) {
            if (!phone) return phone;
            let clean = phone.replace(/\D/g, '');
            if (clean.startsWith('09') && clean.length === 10) return `+593 ${clean.substring(1)}`;
            return phone;
        }

        const formatted = formatPhone(testVisit.contact_phone);
        console.log('Formatted Phone (Search):', formatted);
        console.log('Match?', testVisit.contact_phone === formatted);

        const query = `
            SELECT s.nombre as seller_name, v.created_at
            FROM registraya_vcard_field_visits v
            JOIN registraya_vcard_sellers s ON v.seller_id = s.id
            WHERE (v.contact_phone = ? OR (v.contact_email IS NOT NULL AND v.contact_email = ?))
              AND v.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY v.created_at DESC
            LIMIT 1
        `;

        const [results] = await conn.execute(query, [formatted, 'nonexistent@example.com']);

        if (results.length > 0) {
            console.log("SUCCESS: Huella found!");
        } else {
            console.log("FAILED: Huella not found for existing visit.");

            // Try searching with RAW phone
            const [resultsRaw] = await conn.execute(query, [testVisit.contact_phone, 'nonexistent@example.com']);
            if (resultsRaw.length > 0) {
                console.log("NOTICE: Huella found when using RAW phone. The issue is definitely formatting.");
            }
        }

    } catch (err) {
        console.error("Error during verification:", err);
    } finally {
        if (conn) await conn.end();
    }
}

verify();
