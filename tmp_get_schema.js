
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function getFullSchema() {
    const dbUrl = process.env.DATABASE_URL;
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = dbUrl.match(regex);
    const [, user, password, host, port, database] = match;

    const connection = await mysql.createConnection({
        host,
        user,
        password,
        database,
        port: parseInt(port)
    });

    try {
        const [columns] = await connection.execute("DESCRIBE registraya_vcard_registros");
        let output = "Field | Type | Null | Default\n";
        output += "--- | --- | --- | ---\n";
        columns.forEach(c => {
            output += `${c.Field} | ${c.Type} | ${c.Null} | ${c.Default}\n`;
        });
        fs.writeFileSync('d:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/tmp_schema.txt', output);
        console.log("Schema written to tmp_schema.txt");
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

getFullSchema();
