
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function listTables() {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const parts = trimmedLine.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    });

    const dbConfig = {
        host: env.MYSQL_HOST,
        port: Number(env.MYSQL_PORT),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        connectTimeout: 30000,
    };

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SHOW TABLES');
        const dbName = env.MYSQL_DATABASE;
        const key = `Tables_in_${dbName}`;
        console.log('Tables matching "profile":');
        rows.forEach(row => {
            const tableName = Object.values(row)[0];
            if (tableName.toLowerCase().includes('profile')) {
                console.log('- ' + tableName);
            }
        });
        console.log('All tables:');
        rows.forEach(row => {
            console.log('- ' + Object.values(row)[0]);
        });
    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        await connection.end();
    }
}

listTables();
