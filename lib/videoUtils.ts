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

export const getInstagramID = (url: string): string | null => {
    if (!url) return null;
    if (url.includes('instagram.com')) {
        const match = url.match(/\/(?:p|reels|reel)\/([A-Za-z0-9_-]+)/);
        return match ? match[1] : null;
    }
    return null;
};

export const getFacebookURL = (url: string): string | null => {
    if (!url) return null;
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
        return url;
    }
    return null;
};

/**
 * Retorna la URL de embed correcta según la plataforma detectada.
 */
export const getVideoEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    const ytId = getYouTubeID(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}`;

    const ttId = getTikTokID(url);
    if (ttId) return `https://www.tiktok.com/embed/v2/${ttId}`;

    const igId = getInstagramID(url);
    if (igId) return `https://www.instagram.com/p/${igId}/embed`;

    const fbUrl = getFacebookURL(url);
    if (fbUrl) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(fbUrl)}&show_text=0`;

    return null;
};
