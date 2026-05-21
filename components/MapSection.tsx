"use client";

import { useState, useEffect } from 'react';

interface MapSectionProps {
    googleBusiness?: string;
    businessName: string;
    addressText: string;
    /** Clases CSS para el contenedor del iframe */
    containerClassName?: string;
    /** Estilo inline para el iframe (opcional) */
    iframeStyle?: React.CSSProperties;
    /** Clase CSS para el iframe (opcional) */
    iframeClassName?: string;
    /** Renderizar elementos adicionales antes del mapa (opcional) */
    children?: React.ReactNode;
}

export default function MapSection({
    googleBusiness,
    businessName,
    addressText,
    containerClassName = "w-full h-[400px] md:h-[500px]",
    iframeStyle,
    iframeClassName,
    children
}: MapSectionProps) {
    const rawGoogleBusiness = googleBusiness || "https://maps.app.goo.gl/zGHf7235Myux7T4P7";
    const isGoogleLink = rawGoogleBusiness.startsWith('http');
    const coordMatch = rawGoogleBusiness.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const hasCoords = coordMatch && coordMatch.length >= 3;
    const isIframe = rawGoogleBusiness.trim().toLowerCase().startsWith('<iframe');
    const isEmbedLink = rawGoogleBusiness.includes('/maps/embed');

    const buttonHref = isGoogleLink && !isEmbedLink
        ? rawGoogleBusiness
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText || businessName || "Loja, Ecuador")}`;

    const [mapSrc, setMapSrc] = useState<string>('');

    useEffect(() => {
        if (isIframe) {
            const match = rawGoogleBusiness.match(/src=["'](.*?)["']/);
            if (match) setMapSrc(match[1]);
            return;
        }
        
        if (isEmbedLink) {
            setMapSrc(rawGoogleBusiness);
            return;
        }
        
        if (hasCoords) {
            setMapSrc(makeSrc(`${coordMatch![1]},${coordMatch![2]}`));
            return;
        }
        
        // Sin coordenadas directas: resolver el URL corto via API
        const resolveAndBuild = async () => {
            try {
                const res = await fetch(`/api/resolve-location?url=${encodeURIComponent(rawGoogleBusiness)}&address=${encodeURIComponent(addressText || '')}`);
                const data = await res.json();
                if (data.coords) {
                    setMapSrc(makeSrc(data.coords));
                } else {
                    setMapSrc(makeSrc(addressText || businessName || "Loja, Ecuador"));
                }
            } catch {
                setMapSrc(makeSrc(addressText || businessName || "Loja, Ecuador"));
            }
        };
        
        resolveAndBuild();
    }, []);

    function makeSrc(query: string) {
        if (!query || query.trim() === '') query = "Loja, Ecuador";
        return process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY 
            ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(query)}&zoom=16`
            : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&iwloc=A&output=embed`;
    }

    return (
        <>
            {children}
            <div className={containerClassName}>
                {mapSrc ? (
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, ...iframeStyle }}
                        src={mapSrc}
                        allowFullScreen
                        className={iframeClassName}
                        title="Ubicación en Google Maps"
                    ></iframe>
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/40 text-sm font-bold tracking-widest uppercase">
                        Cargando mapa...
                    </div>
                )}
            </div>
        </>
    );
}
