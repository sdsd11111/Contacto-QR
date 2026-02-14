import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de seguridad: protege rutas admin y API sensibles
 * Valida el header x-admin-key contra ADMIN_API_KEY
 */
export function middleware(request: NextRequest) {
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY;

    // Si no hay ADMIN_API_KEY configurada, bloquear todo acceso protegido
    if (!expectedKey) {
        console.error('ADMIN_API_KEY not configured');
        return NextResponse.json(
            { error: 'Error de configuración del servidor' },
            { status: 500 }
        );
    }

    // Excepción: la ruta /admin necesita cargar la página de login
    // El login se valida via API, no bloqueamos el HTML
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Permitir acceso a la página (el auth se maneja client→server via API)
        return NextResponse.next();
    }

    // Para API routes protegidas: validar header
    if (!adminKey || adminKey !== expectedKey) {
        return NextResponse.json(
            { error: 'No autorizado. Se requiere clave de administrador.' },
            { status: 401 }
        );
    }

    return NextResponse.next();
}

// Aplicar middleware SOLO a estas rutas
export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/registros',
        '/api/survey/list',
        '/api/send-vcard',
    ],
};
