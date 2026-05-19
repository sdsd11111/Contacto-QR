import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function safeParseJson(str: string | null): any {
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

// 1. GET: Obtener todas las categorías de una vCard
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const vcardId = searchParams.get('vcard_id');

        if (!vcardId) {
            return NextResponse.json({ error: 'Falta el parámetro vcard_id' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            // Verificar si existen categorías relacionales
            let [rows] = await connection.execute(
                'SELECT * FROM registraya_menu_categorias WHERE registro_id = ? ORDER BY orden ASC, created_at ASC',
                [vcardId]
            );

            if ((rows as any[]).length === 0) {
                // Si no hay datos, verificar si hay JSON legacy en la tabla vcard
                const [vcardRows] = await connection.execute(
                    'SELECT menu_digital FROM registraya_vcard_registros WHERE id = ?',
                    [vcardId]
                );
                const vcard = (vcardRows as any[])[0];

                if (vcard && vcard.menu_digital && vcard.menu_digital.trim().startsWith('[')) {
                    const legacyMenu = safeParseJson(vcard.menu_digital);
                    if (Array.isArray(legacyMenu) && legacyMenu.length > 0) {
                        console.log(`[Categories GET] Starting JIT menu migration for vcard ID: ${vcardId}...`);
                        await connection.beginTransaction();
                        try {
                            for (let cIdx = 0; cIdx < legacyMenu.length; cIdx++) {
                                const cat = legacyMenu[cIdx];
                                if (!cat || !cat.name) continue;

                                // Insertar Categoría
                                const [catResult] = await connection.execute(
                                    'INSERT INTO registraya_menu_categorias (registro_id, nombre, orden) VALUES (?, ?, ?)',
                                    [vcardId, cat.name.trim(), cIdx]
                                );
                                const categoryId = (catResult as any).insertId;

                                // Insertar Productos de esta Categoría
                                if (Array.isArray(cat.items)) {
                                    for (let pIdx = 0; pIdx < cat.items.length; pIdx++) {
                                        const item = cat.items[pIdx];
                                        if (!item || !item.name) continue;

                                        // Limpiar y validar precio
                                        let cleanPrice = null;
                                        if (item.price) {
                                            const numericStr = String(item.price).replace(/[^\d.]/g, '');
                                            if (numericStr) {
                                                cleanPrice = parseFloat(numericStr);
                                                if (isNaN(cleanPrice)) cleanPrice = null;
                                            }
                                        }

                                        await connection.execute(
                                            `INSERT INTO registraya_menu_productos 
                                             (categoria_id, nombre, descripcion, precio, imagen_url, orden, disponible) 
                                             VALUES (?, ?, ?, ?, ?, ?, 1)`,
                                            [categoryId, item.name.trim(), item.desc || null, cleanPrice, item.image || null, pIdx]
                                        );
                                    }
                                }
                            }
                            await connection.commit();
                            console.log(`[Categories GET] ✅ JIT migration completed for vcard ID: ${vcardId}!`);
                            
                            // Re-fetch categories
                            const [newRows] = await connection.execute(
                                'SELECT * FROM registraya_menu_categorias WHERE registro_id = ? ORDER BY orden ASC, created_at ASC',
                                [vcardId]
                            );
                            rows = newRows;
                        } catch (migrationErr) {
                            await connection.rollback();
                            console.error(`[Categories GET] ❌ JIT Migration failed for vcard ID: ${vcardId}:`, migrationErr);
                        }
                    }
                }
            }

            return NextResponse.json({ success: true, categories: rows });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Error al obtener las categorías' }, { status: 500 });
    }
}

// Helper para validar si el código de edición pertenece a la vCard
async function validateEditCode(connection: any, vcardId: string, code: string): Promise<boolean> {
    if (!vcardId || !code) return false;
    const [rows] = await connection.execute(
        'SELECT id FROM registraya_vcard_registros WHERE id = ? AND UPPER(edit_code) = UPPER(?)',
        [vcardId, code]
    );
    return (rows as any[]).length > 0;
}

// Helper para validar si el código pertenece a la vCard de una categoría específica
async function validateEditCodeByCategoryId(connection: any, categoryId: number, code: string): Promise<string | null> {
    if (!categoryId || !code) return null;
    const [rows] = await connection.execute(
        `SELECT c.registro_id FROM registraya_menu_categorias c 
         JOIN registraya_vcard_registros r ON c.registro_id = r.id 
         WHERE c.id = ? AND UPPER(r.edit_code) = UPPER(?)`,
        [categoryId, code]
    );
    const result = rows as any[];
    return result.length > 0 ? result[0].registro_id : null;
}

// 2. POST: Crear una nueva categoría
export async function POST(req: NextRequest) {
    try {
        const { vcard_id, nombre, orden, code } = await req.json();

        if (!vcard_id || !nombre || !code) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            const authorized = await validateEditCode(connection, vcard_id, code);
            if (!authorized) {
                return NextResponse.json({ error: 'No autorizado o código inválido' }, { status: 401 });
            }

            // Si orden no se provee, asignarlo al final
            let finalOrden = orden;
            if (finalOrden === undefined) {
                const [maxRows] = await connection.execute(
                    'SELECT COALESCE(MAX(orden), -1) as max_orden FROM registraya_menu_categorias WHERE registro_id = ?',
                    [vcard_id]
                );
                finalOrden = (maxRows as any[])[0].max_orden + 1;
            }

            const [result] = await connection.execute(
                'INSERT INTO registraya_menu_categorias (registro_id, nombre, orden) VALUES (?, ?, ?)',
                [vcard_id, nombre.trim(), finalOrden]
            );

            const insertId = (result as any).insertId;

            return NextResponse.json({
                success: true,
                message: 'Categoría creada correctamente',
                category: { id: insertId, registro_id: vcard_id, nombre, orden: finalOrden }
            });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
    }
}

// 3. PUT: Actualizar una categoría (nombre u orden)
export async function PUT(req: NextRequest) {
    try {
        const { id, nombre, orden, code } = await req.json();

        if (!id || !code) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            const vcardId = await validateEditCodeByCategoryId(connection, id, code);
            if (!vcardId) {
                return NextResponse.json({ error: 'No autorizado o código inválido' }, { status: 401 });
            }

            let updateQuery = 'UPDATE registraya_menu_categorias SET ';
            const updateParams: any[] = [];
            const fieldsToUpdate: string[] = [];

            if (nombre !== undefined) {
                fieldsToUpdate.push('nombre = ?');
                updateParams.push(nombre.trim());
            }
            if (orden !== undefined) {
                fieldsToUpdate.push('orden = ?');
                updateParams.push(Number(orden));
            }

            if (fieldsToUpdate.length === 0) {
                return NextResponse.json({ error: 'No hay campos que actualizar' }, { status: 400 });
            }

            updateQuery += fieldsToUpdate.join(', ') + ' WHERE id = ?';
            updateParams.push(id);

            await connection.execute(updateQuery, updateParams);

            return NextResponse.json({
                success: true,
                message: 'Categoría actualizada correctamente'
            });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 });
    }
}

// 4. DELETE: Eliminar una categoría
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const code = searchParams.get('code');

        if (!id || !code) {
            return NextResponse.json({ error: 'Falta el id de la categoría o el código' }, { status: 400 });
        }

        const categoryId = parseInt(id);

        const connection = await pool.getConnection();
        try {
            const vcardId = await validateEditCodeByCategoryId(connection, categoryId, code);
            if (!vcardId) {
                return NextResponse.json({ error: 'No autorizado o código inválido' }, { status: 401 });
            }

            // Borrado físico (la llave foránea ON DELETE CASCADE limpiará los productos relacionados)
            await connection.execute('DELETE FROM registraya_menu_categorias WHERE id = ?', [categoryId]);

            return NextResponse.json({
                success: true,
                message: 'Categoría eliminada correctamente'
            });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Error al eliminar la categoría' }, { status: 500 });
    }
}
