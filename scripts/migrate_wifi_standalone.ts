import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log("Starting migration...");
    console.log("Host:", process.env.MYSQL_HOST);
    
    const dbConfig = {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectTimeout: 30000,
    };

    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log("Checking columns for registraya_vcard_registros...");
        
        // Add wifi_ssid
        try {
            await connection.execute("ALTER TABLE registraya_vcard_registros ADD COLUMN wifi_ssid VARCHAR(255) DEFAULT NULL");
            console.log("✅ Added wifi_ssid column");
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ wifi_ssid column already exists");
            } else {
                console.error("Error adding wifi_ssid:", e.message);
            }
        }

        // Add wifi_password
        try {
            await connection.execute("ALTER TABLE registraya_vcard_registros ADD COLUMN wifi_password VARCHAR(255) DEFAULT NULL");
            console.log("✅ Added wifi_password column");
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ wifi_password column already exists");
            } else {
                console.error("Error adding wifi_password:", e.message);
            }
        }

        console.log("Migration finished.");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
