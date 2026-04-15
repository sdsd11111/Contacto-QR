"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from "lucide-react";

// Import mapping components dynamically to avoid SSR issues with window/document
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Leaflet icon fix setup
let L: any;
if (typeof window !== "undefined") {
    L = require('leaflet');

    // Fix default icon issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default?.src || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: require('leaflet/dist/images/marker-icon.png').default?.src || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: require('leaflet/dist/images/marker-shadow.png').default?.src || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

// Custom Icons
const createColorIcon = (color: string) => {
    if (typeof window === "undefined" || !L) return null;
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

export default function RouteMap({ visits }: { visits: any[] }) {
    const [isClient, setIsClient] = useState(false);
    const [icons, setIcons] = useState<any>({
        no_interesa: null,
        seguimiento: null,
        cierre: null,
        default: null
    });

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined" && L) {
            setIcons({
                no_interesa: createColorIcon('#EF4444'), // Rojo
                seguimiento: createColorIcon('#EAB308'), // Amarillo
                cierre: createColorIcon('#22C55E'), // Verde
                default: createColorIcon('#3B82F6') // Azul
            });
        }
    }, [visits]); // Re-run if visits change to ensure L is ready

    if (!isClient) {
        return (
            <div className="w-full h-[400px] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const mapVisits = visits.filter(v => v.lat && v.lng).map(v => ({
        ...v,
        lat: parseFloat(v.lat),
        lng: parseFloat(v.lng)
    })).filter(v => !isNaN(v.lat) && !isNaN(v.lng)); // Safety check filter

    if (mapVisits.length === 0) {
        return (
            <div className="w-full h-[400px] bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-white/40 font-bold mb-2">Aún no hay puntos registrados en el mapa.</p>
                <p className="text-xs text-white/30">Registra tus visitas permitiendo la ubicación para verlas aquí.</p>
            </div>
        );
    }

    // Calcular el centro geométrico de los puntos
    const centerLat = mapVisits.reduce((sum, v) => sum + v.lat, 0) / mapVisits.length;
    const centerLng = mapVisits.reduce((sum, v) => sum + v.lng, 0) / mapVisits.length;

    const getIconForResult = (result: string) => {
        if (!L) return null;
        switch (result) {
            case 'no_interesa': return icons.no_interesa || icons.default;
            case 'seguimiento': return icons.seguimiento || icons.default;
            case 'cierre': return icons.cierre || icons.default;
            default: return icons.default;
        }
    };

    const getResultLabel = (result: string) => {
        switch (result) {
            case 'no_interesa': return '🔴 No le interesa';
            case 'seguimiento': return '🟡 Seguimiento';
            case 'cierre': return '🟢 Cierre exitoso';
            default: return '🔵 Abierto';
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs font-bold bg-[#0A1229] p-4 rounded-xl border border-white/10">
                <span className="flex items-center gap-2 text-white/60"><div className="w-3 h-3 rounded-full bg-red-500"></div> No Interesa</span>
                <span className="flex items-center gap-2 text-white/60"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Seguimiento</span>
                <span className="flex items-center gap-2 text-white/60"><div className="w-3 h-3 rounded-full bg-green-500"></div> Cierre</span>
            </div>

            <div className="w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden border border-white/10 z-0 relative isolate">
                {MapContainer && TileLayer && Marker && Popup && (
                    <MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Light map theme fits ActivaQR app well
                        />
                        {mapVisits.map((visit, idx) => (
                            <Marker
                                key={idx}
                                position={[visit.lat, visit.lng]}
                                icon={getIconForResult(visit.result)}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <b className="block text-sm text-[#001549]">{visit.businessName}</b>
                                        <span className="text-xs text-gray-500">{visit.category}</span>
                                        <div className="mt-2 text-sm max-w-[150px]">
                                            <p>{getResultLabel(visit.result)}</p>
                                            {visit.notes && <p className="mt-1 text-gray-600 line-clamp-2 italic">"{visit.notes}"</p>}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
