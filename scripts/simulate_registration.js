const fetch = require('node-fetch');

async function simulate() {
    try {
        console.log('Simulating Registration...');

        const body = {
            nombre: 'Test User ' + Date.now(),
            email: 'testuser_' + Date.now() + '@example.com',
            status: 'pagado', // payment status is paid
            seller_id: 2, // Asir Deber usually
            commission_status: 'paid', // TRYING TO FORCE PAID FROM FRONTEND
            plan: 'pro'
        };

        const res = await fetch('http://localhost:3000/api/vcard/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log('API Response:', data);

        if (data.success) {
            console.log('Registration ID:', data.id);
            // Now check the DB
            checkDb(data.id);
        }

    } catch (err) {
        console.error(err);
    }
}

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkDb(id) {
    const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        const [rows] = await c.execute(`
            SELECT id, status, commission_status, seller_id 
            FROM registraya_vcard_registros 
            WHERE id = ?
        `, [id]);
        console.log('Database Record:', rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

simulate();
