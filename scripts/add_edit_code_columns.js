const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addEditCodeColumns() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    try {
        console.log('🔧 Adding edit code columns to registraya_vcard_registros...');

        // Add edit_code column
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN IF NOT EXISTS edit_code VARCHAR(20) UNIQUE
        `);
        console.log('✅ edit_code column added');

        // Add edit_uses_remaining column
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN IF NOT EXISTS edit_uses_remaining INT DEFAULT 2
        `);
        console.log('✅ edit_uses_remaining column added');

        // Add last_edited_at column
        await connection.execute(`
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN IF NOT EXISTS last_edited_at DATETIME NULL
        `);
        console.log('✅ last_edited_at column added');

        // Generate edit codes for existing records (without codes)
        console.log('\n🔄 Generating edit codes for existing records...');

        const [rows] = await connection.execute(
            'SELECT id FROM registraya_vcard_registros WHERE edit_code IS NULL'
        );

        let generatedCount = 0;
        for (const row of rows) {
            const editCode = generateEditCode();
            await connection.execute(
                'UPDATE registraya_vcard_registros SET edit_code = ?, edit_uses_remaining = 2 WHERE id = ?',
                [editCode, row.id]
            );
            generatedCount++;
        }

        console.log(`✅ Generated ${generatedCount} edit codes for existing records`);
        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

function generateEditCode() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digits
    return `RYA-${year}-${randomNum}`;
}

// Run migration
addEditCodeColumns().catch(console.error);
