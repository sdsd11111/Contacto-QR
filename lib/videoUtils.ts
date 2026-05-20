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

export const getYouTubeThumbnail = (url: string): string | null => {
    const id = getYouTubeID(url);
    if (id) {
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return null;
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
        // Si ya es un reel real con ID numérico en la ruta, retornar la URL base limpia
        const canonicalReelMatch = url.match(/facebook\.com\/reel\/(\d+)/);
        if (canonicalReelMatch) {
            return `https://www.facebook.com/reel/${canonicalReelMatch[1]}`;
        }
        const canonicalVideoMatch = url.match(/facebook\.com\/watch\/\?v=(\d+)/) || url.match(/facebook\.com\/video\.php\?v=(\d+)/) || url.match(/facebook\.com\/[^\/]+\/videos\/(\d+)/);
        if (canonicalVideoMatch) {
            return `https://www.facebook.com/video.php?v=${canonicalVideoMatch[1]}`;
        }

        // Transformar links de redirección móvil /share/r/ a links nativos de Reel
        const shareReelMatch = url.match(/\/share\/r\/([A-Za-z0-9_-]+)/);
        if (shareReelMatch) {
            return `https://www.facebook.com/reel/${shareReelMatch[1]}`;
        }
        // Transformar links de redirección móvil /share/v/ a links nativos de Video
        const shareVideoMatch = url.match(/\/share\/v\/([A-Za-z0-9_-]+)/);
        if (shareVideoMatch) {
            return `https://www.facebook.com/video.php?v=${shareVideoMatch[1]}`;
        }
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

    // Si pasaron un iframe de YouTube/TikTok/Vimeo, intentar extraer el src
    if (url.trim().toLowerCase().startsWith('<iframe')) {
        const srcMatch = url.match(/src=["'](.*?)["']/);
        if (srcMatch && srcMatch[1]) {
            return srcMatch[1];
        }
    }

    return null;
};

/**
 * Determina si un video es vertical (TikTok, Instagram, YouTube Shorts, Facebook Reels).
 */
export const checkIsVerticalVideo = (url: string | null | undefined): boolean => {
    if (!url) return false;
    let cleanUrl = url.trim().toLowerCase();

    // Si es un iframe, extraemos la URL de src
    if (cleanUrl.startsWith('<iframe')) {
        const srcMatch = url.match(/src=["'](.*?)["']/i);
        if (srcMatch && srcMatch[1]) {
            cleanUrl = srcMatch[1].toLowerCase();
        }
    }

    // 1. TikTok siempre es vertical (9:16)
    if (cleanUrl.includes('tiktok.com')) return true;

    // 2. Instagram suele ser vertical o cuadrado (lo tratamos como vertical en la UI)
    if (cleanUrl.includes('instagram.com')) return true;

    // 3. YouTube Shorts son verticales (9:16)
    if (cleanUrl.includes('youtube.com/shorts') || cleanUrl.includes('youtu.be/shorts')) return true;

    // 4. Facebook Reels son verticales (9:16)
    if (
        cleanUrl.includes('facebook.com/reel') || 
        cleanUrl.includes('/share/r/') || 
        (cleanUrl.includes('facebook.com/plugins/video') && cleanUrl.includes('/reel/'))
    ) {
        return true;
    }

    return false;
};

