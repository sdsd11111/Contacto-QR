require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const dbConfig = {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Conectado a la base de datos.");

        const query = `
            ALTER TABLE registraya_vcard_registros 
            ADD COLUMN template_id VARCHAR(50) DEFAULT 'classic' AFTER plan;
        `;
        
        console.log("Ejecutando:", query);
        const [result] = await connection.execute(query);
        console.log("Columna template_id agregada con éxito:", result);
        
        await connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("La columna template_id ya existe.");
        } else {
            console.error("Error al alterar la tabla:", error);
        }
    }
}

main();
