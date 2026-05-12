import pool from './lib/db.js';

async function migrate() {
    try {
        console.log("Checking columns for registraya_vcard_registros...");
        
        // Add wifi_ssid
        try {
            await pool.execute("ALTER TABLE registraya_vcard_registros ADD COLUMN wifi_ssid VARCHAR(255) DEFAULT NULL");
            console.log("✅ Added wifi_ssid column");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ wifi_ssid column already exists");
            } else {
                throw e;
            }
        }

        // Add wifi_password
        try {
            await pool.execute("ALTER TABLE registraya_vcard_registros ADD COLUMN wifi_password VARCHAR(255) DEFAULT NULL");
            console.log("✅ Added wifi_password column");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ wifi_password column already exists");
            } else {
                throw e;
            }
        }

        console.log("Migration finished.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
