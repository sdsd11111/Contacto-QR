
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function findSlugTable() {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split(/\r?\n/).forEach(line => {
        const parts = line.trim().split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
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
        const [tables] = await connection.execute('SHOW TABLES');
        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            try {
                const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName} LIKE 'slug'`);
                if (columns.length > 0) {
                    console.log('Table with "slug" column found:', tableName);
                }
            } catch (innerError) {
                // Ignore errors on specific tables (e.g., views or permissions issues)
            }
        }
    } catch (error) {
        console.error('Error finding slug table:', error);
    } finally {
        await connection.end();
    }
}

findSlugTable();
