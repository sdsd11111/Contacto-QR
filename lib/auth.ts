/**
 * Utilidades de autenticación server-side para admin
 * 
 * Uso recomendado en endpoints:
 *   const auth = requireAdmin(request);
 *   if (auth) return auth; // Retorna 401 si no autorizado
 */

import { NextResponse } from 'next/server';

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
 * Valida el header Authorization Bearer + query param key contra CRON_SECRET
 * usado por endpoints de cron jobs y tareas programadas.
 * @returns true si el secreto es válido
 */
export function validateCronSecret(request: Request): boolean {
    const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;
    if (!cronSecret) {
        console.error('CRON_SECRET/ADMIN_API_KEY no está configurada');
        return false;
    }

    // 1. Header Authorization: Bearer <secret>
    const authHeader = request.headers.get('Authorization');
    if (authHeader === `Bearer ${cronSecret}`) return true;

    // 2. Query param ?key=<secret>
    const { searchParams } = new URL(request.url);
    if (searchParams.get('key') === cronSecret) return true;

    return false;
}

/**
 * Guard combinado: valida admin key o cron secret.
 * Útil para endpoints que aceptan ambos métodos de autenticación.
 */
export function validateAdminOrCron(request: Request): boolean {
    return validateAdminKey(request) || validateCronSecret(request);
}

/**
 * Helper: Requiere autenticación de admin (x-admin-key).
 * Retorna null si está autorizado, o una NextResponse 401 si no.
 * 
 * @example
 *   const auth = requireAdmin(request);
 *   if (auth) return auth;
 */
export function requireAdmin(request: Request): NextResponse | null {
    if (!validateAdminKey(request)) {
        return NextResponse.json(
            { error: 'No autorizado. Se requiere clave de administrador.' },
            { status: 401 }
        );
    }
    return null;
}

/**
 * Helper: Requiere autenticación de cron (Bearer + query param).
 * Retorna null si está autorizado, o una NextResponse 401 si no.
 */
export function requireCron(request: Request): NextResponse | null {
    if (!validateCronSecret(request)) {
        return NextResponse.json(
            { error: 'No autorizado. Se requiere token de cron.' },
            { status: 401 }
        );
    }
    return null;
}

/**
 * Respuesta estándar de 401 Unauthorized
 * @deprecated Usar requireAdmin() o requireCron() en su lugar
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

// ─── Password Hashing (scrypt) ─────────────────────────────────────────

/**
 * Hashea una contraseña usando scrypt con salt aleatorio.
 * Formato de almacenamiento: "salt:hash" (base64)
 */
export async function hashPassword(password: string): Promise<string> {
    const { scrypt, randomBytes } = await import('crypto');
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

/**
 * Verifica una contraseña contra un hash almacenado (formato "salt:hash")
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const { scrypt } = await import('crypto');
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    return new Promise((resolve, reject) => {
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey.toString('hex') === hash);
        });
    });
}

// ─── Seller Session Token (HMAC-SHA256) ────────────────────────────────

const SELLER_TOKEN_SECRET = process.env.SELLER_TOKEN_SECRET || process.env.ADMIN_API_KEY || 'seller-token-secret';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface SellerTokenPayload {
    id: number;
    email: string;
    nombre: string;
    role: string;
    exp: number;
}

/**
 * Genera un token de sesión para vendedor firmado con HMAC-SHA256
 */
export function generateSellerToken(seller: { id: number; email: string; nombre: string; role: string }): string {
    const crypto = require('crypto');
    const payload: SellerTokenPayload = {
        ...seller,
        exp: Date.now() + TOKEN_EXPIRY_MS
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
        .createHmac('sha256', SELLER_TOKEN_SECRET)
        .update(payloadB64)
        .digest('hex');
    return `${payloadB64}.${signature}`;
}

/**
 * Verifica un token de sesión de vendedor.
 * Retorna el payload si es válido, null si expiró o firma inválida.
 */
export function verifySellerToken(token: string): SellerTokenPayload | null {
    try {
        const crypto = require('crypto');
        const [payloadB64, signature] = token.split('.');
        if (!payloadB64 || !signature) return null;

        const expectedSig = crypto
            .createHmac('sha256', SELLER_TOKEN_SECRET)
            .update(payloadB64)
            .digest('hex');

        if (signature !== expectedSig) return null;

        const payload: SellerTokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
        if (Date.now() > payload.exp) return null;

        return payload;
    } catch {
        return null;
    }
}

/**
 * Extrae y verifica un token del header Authorization.
 * Retorna null si no hay token o es inválido.
 * 
 * @example
 *   const seller = requireSellerAuth(request);
 *   if (!seller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
 */
export function requireSellerAuth(request: Request): SellerTokenPayload | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    return verifySellerToken(token);
}
