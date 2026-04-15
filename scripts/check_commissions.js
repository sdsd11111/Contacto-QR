const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });
    return env;
}

async function check() {
    const env = loadEnv();
    const config = {
        host: env.MYSQL_HOST,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        port: Number(env.MYSQL_PORT) || 3306,
    };

    const c = await mysql.createConnection(config);
    try {
        const [rows] = await c.execute('SELECT nombre, email, status, commission_status, seller_id FROM registraya_vcard_registros ORDER BY created_at DESC LIMIT 5');
        console.log('Last 5 registrations:');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await c.end();
        process.exit(0);
    }
}

check();
