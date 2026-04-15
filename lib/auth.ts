/**
 * Utilidades de autenticación server-side para admin
 */

/**
 * Valida el header x-admin-key contra la variable de entorno ADMIN_API_KEY
 * @returns true si el key es válido
 */
export function validateAdminKey(request: Request): boolean {
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
        console.error('ADMIN_API_KEY no está configurada en las variables de entorno');
        return false;
    }

    return adminKey === expectedKey;
}

/**
 * Respuesta estándar de 401 Unauthorized
 */
export function unauthorizedResponse() {
    return new Response(
        JSON.stringify({ error: 'No autorizado. Se requiere clave de administrador.' }),
        {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
