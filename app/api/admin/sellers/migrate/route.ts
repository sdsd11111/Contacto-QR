import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function POST(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { fromLeaderId, toLeaderId } = await req.json();

        if (!fromLeaderId) {
            return NextResponse.json({ error: 'ID de Líder origen es requerido' }, { status: 400 });
        }

        // Si toLeaderId es null o 0, se convierten en Vendedores Oficiales (parent_id = NULL)
        const targetParentId = (toLeaderId === 0 || toLeaderId === null) ? null : toLeaderId;

        // 1. Verificar existencia del líder origen
        const [origin]: any = await pool.execute('SELECT nombre FROM registraya_vcard_sellers WHERE id = ?', [fromLeaderId]);
        if (origin.length === 0) {
            return NextResponse.json({ error: 'Líder de origen no encontrado' }, { status: 404 });
        }

        // 2. Ejecutar la migración masiva
        const query = `UPDATE registraya_vcard_sellers SET parent_id = ? WHERE parent_id = ?`;
        const [result]: any = await pool.execute(query, [targetParentId, fromLeaderId]);

        return NextResponse.json({
            success: true,
            message: `Se han migrado ${result.affectedRows} sub-vendedores correctamente.`,
            migratedCount: result.affectedRows
        });

    } catch (err: any) {
        console.error('Error migrating team:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
