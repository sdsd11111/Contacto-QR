const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function update() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: Number(process.env.MYSQL_PORT) || 3306,
    });

    try {
        const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Test video
        const [result] = await connection.execute(
            'UPDATE registraya_vcard_registros SET youtube_video_url = ? WHERE slug = ?',
            [videoUrl, 'activaqr-9ag4']
        );
        console.log('Update result:', result);
        console.log('YouTube video URL updated successfully.');
    } catch (err) {
        console.error('Update error:', err);
    } finally {
        await connection.end();
    }
}

update();
