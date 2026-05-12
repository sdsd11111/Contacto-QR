import mysql from 'mysql2/promise';

async function run() {
    const url = "mysql://n2oog5o021sytl1l:o16p5ehm8o3a8jhe@k0fzywjk0o248aox.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/q72sryo6g3q1858c";
    console.log("Connecting database...");
    const connection = await mysql.createConnection(url);
    try {
        await connection.execute('ALTER TABLE registraya_vcard_sellers ADD COLUMN terminos_aceptados_en DATETIME NULL;');
        console.log("Column added.");
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}
run();
