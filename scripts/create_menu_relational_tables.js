const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function runMigration() {
    console.log("Connecting to the database for menu relational migration...");
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    console.log("Connected successfully. Creating table: registraya_menu_categorias...");
    const createCategoriesQuery = `
        CREATE TABLE IF NOT EXISTS registraya_menu_categorias (
            id INT AUTO_INCREMENT PRIMARY KEY,
            registro_id VARCHAR(36) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            orden INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (registro_id) REFERENCES registraya_vcard_registros(id) ON DELETE CASCADE,
            INDEX idx_registro_orden (registro_id, orden)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log("Creating table: registraya_menu_productos...");
    const createProductsQuery = `
        CREATE TABLE IF NOT EXISTS registraya_menu_productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            categoria_id INT NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT NULL,
            precio DECIMAL(10, 2) NULL,
            imagen_url TEXT NULL,
            orden INT DEFAULT 0,
            disponible TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES registraya_menu_categorias(id) ON DELETE CASCADE,
            INDEX idx_categoria_orden (categoria_id, orden)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
        await connection.execute(createCategoriesQuery);
        console.log("✅ Table 'registraya_menu_categorias' created successfully!");
        
        await connection.execute(createProductsQuery);
        console.log("✅ Table 'registraya_menu_productos' created successfully!");
        
    } catch (err) {
        console.error("❌ Error running migration:", err);
    } finally {
        await connection.end();
        console.log("Database connection closed.");
    }
}

runMigration();
