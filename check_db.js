
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('d:/Abel paginas/Generador QR contacto/Generador de vcard y codigos QR/vcard-app/database.sqlite');

db.get("SELECT google_business, address, direccion FROM registraya_vcard_registros WHERE slug = 'activaqr-9ag4'", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(row, null, 2));
    }
    db.close();
});
