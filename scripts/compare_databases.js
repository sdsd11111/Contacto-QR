const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = 'https://ilhgwqgouwomehgxivbo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaGd3cWdvdXdvbWVoZ3hpdmJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIzODU0MiwiZXhwIjoyMDg1ODE0NTQyfQ.FLu-Z2F85-xdpmjuScwzjfbvGp1op5ba0t1qeDbmOSg';

function fetchSupabase(table) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=created_at.asc`);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Parse error: ' + data.substring(0, 200))); }
            });
        }).on('error', reject);
    });
}

async function main() {
    // 1. Try to find the right table name in Supabase
    console.log('=== EXPLORING SUPABASE ===');

    // Try common table names
    const tableNames = ['registros', 'registraya_vcard_registros', 'vcard_registros', 'users', 'contacts'];
    let sbRecords = null;
    let foundTable = null;

    for (const table of tableNames) {
        try {
            const result = await fetchSupabase(table);
            if (Array.isArray(result) && result.length >= 0) {
                console.log(`✅ Table "${table}" found! Records: ${result.length}`);
                sbRecords = result;
                foundTable = table;
                break;
            } else if (result.message) {
                console.log(`❌ Table "${table}": ${result.message}`);
            }
        } catch (e) {
            console.log(`❌ Table "${table}": ${e.message}`);
        }
    }

    if (!sbRecords) {
        console.log('\n⚠️ Could not find the table. Let me try to list all tables...');
        // Try the RPC endpoint to list tables
        const listUrl = new URL(`${SUPABASE_URL}/rest/v1/`);
        const options = {
            hostname: listUrl.hostname,
            path: listUrl.pathname,
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        };

        await new Promise((resolve) => {
            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    console.log('API root response:', data.substring(0, 500));
                    resolve();
                });
            }).on('error', (e) => { console.log('Error:', e.message); resolve(); });
        });

        process.exit(1);
    }

    console.log(`\nUsing Supabase table: "${foundTable}"`);
    console.log(`Supabase total records: ${sbRecords.length}`);

    // Show Supabase schema
    if (sbRecords.length > 0) {
        console.log('\n=== SUPABASE SCHEMA ===');
        console.log('Columns:', Object.keys(sbRecords[0]).join(', '));
    }

    // 2. Fetch MySQL records
    console.log('\n=== FETCHING MYSQL RECORDS ===');
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };
    const c = await mysql.createConnection(config);
    const [mysqlRows] = await c.execute('SELECT id, slug, email, nombre, status, created_at FROM registraya_vcard_registros ORDER BY created_at ASC');
    console.log(`MySQL total records: ${mysqlRows.length}`);

    // 3. List all records from both
    console.log('\n=== SUPABASE RECORDS ===');
    sbRecords.forEach((r, i) => {
        console.log(`  [SB-${i + 1}] email=${r.email || 'N/A'} | slug=${r.slug || 'N/A'} | nombre=${r.nombre || r.name || 'N/A'} | status=${r.status || 'N/A'}`);
    });

    console.log('\n=== MYSQL RECORDS ===');
    mysqlRows.forEach((r, i) => {
        console.log(`  [MY-${i + 1}] email=${r.email || 'N/A'} | slug=${r.slug || 'N/A'} | nombre=${r.nombre || 'N/A'} | status=${r.status || 'N/A'}`);
    });

    // 4. Compare
    const mysqlEmails = new Set(mysqlRows.map(r => (r.email || '').toLowerCase().trim()));
    const mysqlSlugs = new Set(mysqlRows.map(r => (r.slug || '').toLowerCase().trim()));

    const missing = sbRecords.filter(r => !mysqlEmails.has((r.email || '').toLowerCase().trim()));

    console.log('\n=== MISSING FROM MYSQL ===');
    if (missing.length === 0) {
        console.log('✅ All Supabase records already exist in MySQL!');
    } else {
        console.log(`⚠️ Found ${missing.length} records in Supabase that are NOT in MySQL:`);
        missing.forEach((r, i) => {
            const slugConflict = mysqlSlugs.has((r.slug || '').toLowerCase().trim());
            console.log(`  [MISSING-${i + 1}] email=${r.email} | slug=${r.slug} | nombre=${r.nombre || r.name} | status=${r.status}${slugConflict ? ' ⚠️ SLUG CONFLICT!' : ' ✅ slug available'}`);
        });
    }

    // 5. Slug mismatches (same email but different slug = DANGER for QR)
    console.log('\n=== SLUG MISMATCHES (same email, different slug = QR DANGER) ===');
    let mismatches = 0;
    sbRecords.forEach(sbr => {
        const myRecord = mysqlRows.find(m => (m.email || '').toLowerCase().trim() === (sbr.email || '').toLowerCase().trim());
        if (myRecord && myRecord.slug !== sbr.slug) {
            console.log(`  ⚠️ email=${sbr.email}: Supabase slug="${sbr.slug}" vs MySQL slug="${myRecord.slug}"`);
            mismatches++;
        }
    });
    if (mismatches === 0) console.log('✅ No slug mismatches!');
    else console.log(`⚠️ ${mismatches} slug mismatches found! These QR codes may break.`);

    await c.end();
    process.exit(0);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
