import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1. GET: Obtener los productos de una categoría (con soporte opcional para paginación / Infinite Scroll)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoriaId = searchParams.get('categoria_id');
        const limitStr = searchParams.get('limit');
        const offsetStr = searchParams.get('offset');

        if (!categoriaId) {
            return NextResponse.json({ error: 'Falta el parámetro categoria_id' }, { status: 400 });
        }

        const catId = parseInt(categoriaId);
        const connection = await pool.getConnection();

        try {
            let query = 'SELECT * FROM registraya_menu_productos WHERE categoria_id = ? ORDER BY orden ASC, created_at ASC';
            const queryParams: any[] = [catId];

            if (limitStr) {
                const limit = parseInt(limitStr);
                const offset = offsetStr ? parseInt(offsetStr) : 0;
                query += ' LIMIT ? OFFSET ?';
                queryParams.push(limit, offset);
            }

            const [rows] = await connection.execute(query, queryParams);
            return NextResponse.json({ success: true, products: rows });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 });
    }
}

// Helper para validar si el código de edición es dueño del producto a través de su categoría
async function validateEditCodeByProduct(connection: any, productId: number, code: string): Promise<boolean> {
    if (!productId || !code) return false;
    const [rows] = await connection.execute(
        `SELECT r.id FROM registraya_menu_productos p 
         JOIN registraya_menu_categorias c ON p.categoria_id = c.id 
         JOIN registraya_vcard_registros r ON c.registro_id = r.id 
         WHERE p.id = ? AND UPPER(r.edit_code) = UPPER(?)`,
        [productId, code]
    );
    return (rows as any[]).length > 0;
}

// Helper para validar si el código de edición es dueño de la categoría
async function validateEditCodeByCategory(connection: any, categoryId: number, code: string): Promise<boolean> {
    if (!categoryId || !code) return false;
    const [rows] = await connection.execute(
        `SELECT r.id FROM registraya_menu_categorias c 
         JOIN registraya_vcard_registros r ON c.registro_id = r.id 
         WHERE c.id = ? AND UPPER(r.edit_code) = UPPER(?)`,
        [categoryId, code]
    );
    return (rows as any[]).length > 0;
}

// 2. POST: Crear un nuevo producto/servicio
export async function POST(req: NextRequest) {
    try {
        const { categoria_id, nombre, descripcion, precio, imagen_url, orden, disponible, code } = await req.json();

        if (!categoria_id || !nombre || !code) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const catId = parseInt(categoria_id);
        const connection = await pool.getConnection();

        try {
            const authorized = await validateEditCodeByCategory(connection, catId, code);
            if (!authorized) {
                return NextResponse.json({ error: 'No autorizado o código inválido' }, { status: 401 });
            }

            // Si orden no se provee, asignarlo al final
            let finalOrden = orden;
            if (finalOrden === undefined) {
                const [maxRows] = await connection.execute(
                    'SELECT COALESCE(MAX(orden), -1) as max_orden FROM registraya_menu_productos WHERE categoria_id = ?',
                    [catId]
                );
                finalOrden = (maxRows as any[])[0].max_orden + 1;
            }

            const isAvailable = disponible !== undefined ? Number(disponible) : 1;
            const itemPrecio = precio ? Number(precio) : null;

            const [result] = await connection.execute(
                `INSERT INTO registraya_menu_productos 
                 (categoria_id, nombre, descripcion, precio, imagen_url, orden, disponible) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [catId, nombre.trim(), descripcion || null, itemPrecio, imagen_url || null, finalOrden, isAvailable]
            );

            const insertId = (result as any).insertId;

            return NextResponse.json({
                success: true,
                message: 'Producto creado correctamente',
                product: {
                    id: insertId,
                    categoria_id: catId,
                    nombre,
                    descripcion: descripcion || null,
                    precio: itemPrecio,
                    imagen_url: imagen_url || null,
                    orden: finalOrden,
                    disponible: isAvailable
                }
            });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
    }
}

// 3. PUT: Actualizar campos de un producto
export async function PUT(req: NextRequest) {
    try {
        const { id, nombre, descripcion, precio, imagen_url, orden, disponible, categoria_id, code } = await req.json();

        if (!id || !code) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const prodId = parseInt(id);
        const connection = await pool.getConnection();

        try {
            const authorized = await validateEditCodeByProduct(connection, prodId, code);
            if (!authorized) {
                return NextResponse.json({ error: 'No autorizado o código inválido' }, { status: 401 });
            }

            let updateQuery = 'UPDATE registraya_menu_productos SET ';
            const updateParams: any[] = [];
            const fieldsToUpdate: string[] = [];

            if (nombre !== undefined) {
                fieldsToUpdate.push('nombre = ?');
                updateParams.push(nombre.trim());
            }
            if (descripcion !== undefined) {
                fieldsToUpdate.push('descripcion = ?');
                updateParams.push(descripcion);
            }
            if (precio !== undefined) {
                fieldsToUpdate.push('precio = ?');
                updateParams.push(precio !== null ? Number(precio) : null);
            }
            if (imagen_url !== undefined) {
                fieldsToUpdate.push('imagen_url = ?');
                updateParams.push(imagen_url);
            }
            if (orden !== undefined) {
                fieldsToUpdate.push('orden = ?');
                updateParams.push(Number(orden));
            }
            if (disponible !== undefined) {
                fieldsToUpdate.push('disponible = ?');
                updateParams.push(Number(disponible));
            }
            if (categoria_id !== undefined) {
                // Verificar que también sea dueño de la nueva categoría si se mueve
                const catAuthorized = await validateEditCodeByCategory(connection, parseInt(categoria_id), code);
                if (!catAuthorized) {
                    return NextResponse.json({ error: 'Nueva categoría inválida o no autorizada' }, { status: 401 });
                }
                fieldsToUpdate.push('categoria_id = ?');
                updateParams.push(parseInt(categoria_id));
            }

            if (fieldsToUpdate.length === 0) {
                return NextResponse.json({ error: 'No hay campos que actualizar' }, { status: 400 });
            }

            updateQuery += fieldsToUpdate.join(', ') + ' WHERE id = ?';
            updateParams.push(prodId);

            await connection.execute(updateQuery, updateParams);

            return NextResponse.json({
                success: true,
                message: 'Producto actualizado correctamente'
            });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
    }
}

// 4. DELETE: Eliminar un producto
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const code = searchParams.get('code');

        if (!id || !code) {
            return NextResponse.json({ error: 'Falta el id del producto o el código' }, { status: 400 });
        }

        const prodId = parseInt(id);
        const connection = await pool.getConnection();

        try {
            const authorized = await validateEditCodeByProduct(connection, prodId, code);
            if (!authorized) {
                return NextResponse.json({ error: 'No autorizado o código inválido' }, { status: 401 });
            }

            await connection.execute('DELETE FROM registraya_menu_productos WHERE id = ?', [prodId]);

            return NextResponse.json({
                success: true,
                message: 'Producto eliminado correctamente'
            });
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
    }
}
