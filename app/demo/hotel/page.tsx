import React from 'react';
import DemoBuilder from '@/components/DemoBuilder';

export default function HotelDemoPage() {
    const demoData = {
        nombre_negocio: 'Grand Horizon Hotel',
        profesion: 'Lujo & Hospitalidad de Clase Mundial',
        bio: 'Descubra la máxima expresión del confort en el corazón de la ciudad. Suites de lujo, gastronomía internacional y un servicio personalizado que hará de su estancia una experiencia inolvidable.',
        whatsapp: '+593991234567',
        email: 'reservas@grandhorizon.com',
        address: 'Av. de las Palmeras 450, Salinas, Ecuador',
        portada_desktop: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
        portada_movil: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        foto_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
    };

    return <DemoBuilder template="hedkandi" data={demoData} />;
}
