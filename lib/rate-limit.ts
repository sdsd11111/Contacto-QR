// Rate limiter in-memory simple para endpoints
// En producción se podría usar Redis, pero para este caso es suficiente

interface RateLimitEntry {
    timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        entry.timestamps = entry.timestamps.filter(t => now - t < 300000); // 5 min
        if (entry.timestamps.length === 0) {
            rateLimitMap.delete(key);
        }
    }
}, 300000);

/**
 * Verifica si una IP/key ha excedido el rate limit
 * @param key - Identificador único (IP, email, etc.)
 * @param maxRequests - Máximo de requests permitidos
 * @param windowMs - Ventana de tiempo en milisegundos
 * @returns true si se excedió el límite
 */
export function isRateLimited(
    key: string,
    maxRequests: number,
    windowMs: number
): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key) || { timestamps: [] };

    // Filtrar timestamps dentro de la ventana
    entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
        return true; // Rate limited
    }

    entry.timestamps.push(now);
    rateLimitMap.set(key, entry);
    return false;
}

/**
 * Extrae la IP del request (compatible con Vercel)
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp;
    return 'unknown';
}
