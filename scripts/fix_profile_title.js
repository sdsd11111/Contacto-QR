
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function fixProfile() {
    // Manually parse .env.local because this is a standalone script
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        
        const parts = trimmedLine.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            env[key] = value;
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

    console.log('Connecting to database:', dbConfig.host);
    const connection = await mysql.createConnection(dbConfig);

    try {
        const slug = 'activaqr-9ag4';
        const newName = 'ACTIVAQR';

        console.log(`Updating profile ${slug} with name: ${newName}...`);
        
        const [result] = await connection.execute(
            'UPDATE registraya_vcard_registros SET nombre = ? WHERE slug = ?',
            [newName, slug]
        );

        console.log('Update result:', result);
        
        if (result.affectedRows > 0) {
            console.log('Successfully updated profile name.');
        } else {
            console.log('No rows affected. Verify if the slug exists.');
        }

    } catch (error) {
        console.error('Error during update:', error);
    } finally {
        await connection.end();
    }
}

fixProfile();
