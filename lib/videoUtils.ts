/**
 * lib/videoUtils.ts
 * Utilidades centralizadas para extracción de IDs de video.
 * Fuente única de verdad — NO duplicar en templates individuales.
 */

export const getYouTubeID = (url: string): string | null => {
    if (!url) return null;
    // Soporte para IDs directos de 11 caracteres
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

export const getTikTokID = (url: string): string | null => {
    if (!url) return null;
    if (url.includes('tiktok.com')) {
        const match = url.match(/\/video\/(\d+)/) || url.match(/\/v\/(\d+)/);
        return match ? match[1] : null;
    }
    return null;
};
