import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const address = request.nextUrl.searchParams.get('address');
    
    let coords = null;
    let resolvedUrl = url;
    
    // Intentar seguir la redirección del short URL de Google Maps
    if (url && url.startsWith('http')) {
        try {
            const res = await fetch(url, { 
                method: 'HEAD',
                redirect: 'manual',
                signal: AbortSignal.timeout(5000)
            });
            
            // Si hay redirect, seguir hasta obtener la URL final
            let finalUrl = url;
            let currentRes = res;
            let redirectCount = 0;
            const maxRedirects = 5;
            
            while ((currentRes.status === 301 || currentRes.status === 302 || currentRes.status === 303 || currentRes.status === 307 || currentRes.status === 308) && redirectCount < maxRedirects) {
                const location = currentRes.headers.get('location');
                if (!location) break;
                finalUrl = location.startsWith('http') ? location : new URL(location, finalUrl).href;
                currentRes = await fetch(finalUrl, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(5000) });
                redirectCount++;
            }
            
            resolvedUrl = finalUrl;
            
            // Extraer coordenadas del formato @lat,lng
            const coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch && coordMatch.length >= 3) {
                coords = `${coordMatch[1]},${coordMatch[2]}`;
            }
            
            // También intentar extraer place ID
            const placeMatch = finalUrl.match(/place\/([^\/@?]+)/);
            const placeId = placeMatch ? decodeURIComponent(placeMatch[1]) : null;
            
            return NextResponse.json({ 
                coords, 
                resolvedUrl: finalUrl,
                placeName: placeId,
                address: address || null
            });
        } catch (err) {
            console.error('[resolve-location] Error:', err);
            return NextResponse.json({ coords: null, resolvedUrl: url, error: 'Failed to resolve' });
        }
    }
    
    return NextResponse.json({ coords: null, resolvedUrl: url });
}
