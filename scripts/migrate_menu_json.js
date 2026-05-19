const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

function repairTruncatedJson(str) {
    if (!str) return null;
    str = str.trim();
    if (str.startsWith('{') || str.startsWith('[')) {
        try {
            return JSON.parse(str);
        } catch (e) {
            // Let's try to backtrace and fix
            const suffixes = ["", "]", "}", "}]", "}]]", "]}", "]}]", "}]}]", "}]}]]", "}]}]}}", "\"}]}]"];
            for (let i = str.length; i > 0; i--) {
                const sub = str.substring(0, i);
                for (const suffix of suffixes) {
                    try {
                        const candidate = sub + suffix;
                        const parsed = JSON.parse(candidate);
                        return parsed;
                    } catch (err) {}
                }
            }
        }
    }
    return null;
}

async function run() {
    console.log("Starting menu migration...");
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        const [rows] = await connection.execute(
            'SELECT id, slug, menu_digital FROM registraya_vcard_registros WHERE menu_digital IS NOT NULL AND menu_digital != ""'
        );

        console.log(`Found ${rows.length} records to process.`);

        for (const row of rows) {
            console.log(`Processing ${row.slug} (${row.id})...`);
            const menuData = repairTruncatedJson(row.menu_digital);
            if (!menuData || !Array.isArray(menuData)) {
                console.log(`⚠️ Skip or failed to parse menu_digital for ${row.slug}`);
                continue;
            }

            // Clean old data for this user in relational tables
            await connection.execute('DELETE FROM registraya_menu_categorias WHERE registro_id = ?', [row.id]);

            let catOrder = 0;
            for (const cat of menuData) {
                const catName = cat.name || cat.nombre || 'Categoría';
                const [catResult] = await connection.execute(
                    'INSERT INTO registraya_menu_categorias (registro_id, nombre, orden) VALUES (?, ?, ?)',
                    [row.id, catName, catOrder++]
                );
                const categoryId = catResult.insertId;

                const items = cat.items || [];
                let prodOrder = 0;
                for (const item of items) {
                    const prodName = item.name || item.titulo || item.nombre;
                    if (!prodName) continue;
                    
                    const desc = item.desc || item.descripcion || null;
                    let price = null;
                    if (item.price || item.precio) {
                        const rawPrice = String(item.price || item.precio).replace(/[^\d.]/g, '');
                        const parsedPrice = parseFloat(rawPrice);
                        if (!isNaN(parsedPrice)) {
                            price = parsedPrice;
                        }
                    }
                    const disponible = item.disponible !== undefined ? item.disponible : 1;

                    await connection.execute(
                        'INSERT INTO registraya_menu_productos (categoria_id, nombre, descripcion, precio, orden, disponible) VALUES (?, ?, ?, ?, ?, ?)',
                        [categoryId, prodName, desc, price, prodOrder++, disponible]
                    );
                }
            }
            console.log(`✅ Successfully migrated menu for ${row.slug}`);
        }
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await connection.end();
    }
}

run();
