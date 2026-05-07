/**
 * lib/jsonUtils.ts
 * Helpers defensivos para parseo de JSON desde la base de datos.
 * Previene crashes de pantalla blanca por datos malformados.
 */

/**
 * Parsea un JSON de forma segura. Si falla, devuelve el fallback.
 * Acepta también valores ya parseados (objeto/array) y los retorna directamente.
 */
export function safeParse<T>(val: string | T | null | undefined, fallback: T): T {
    if (val === null || val === undefined) return fallback;
    if (typeof val !== 'string') return val as T;
    try {
        return JSON.parse(val) as T;
    } catch {
        console.warn('[safeParse] JSON inválido:', val?.slice?.(0, 100));
        return fallback;
    }
}
