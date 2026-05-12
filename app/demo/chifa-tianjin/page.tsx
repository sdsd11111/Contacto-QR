"use client";

import DemoBuilder from '@/components/DemoBuilder';
import type { ExperienceImage } from '@/components/templates/types';
import type { MenuCategory } from '@/components/kits/types';

// ─── Datos del menú en formato MenuCategory[] ───
const MENU_CATEGORIES: MenuCategory[] = [
    {
        name: 'Chaulafán',
        items: [
            { name: 'Chaulafán KAY FAN', price: '$6,75', size: 'Entero' },
            { name: 'Chaulafán vegetariano', price: '$5,25', size: 'Entero' },
            { name: 'Chaulafán de pollo', price: '$6,00', size: 'Entero' },
            { name: 'Chaulafán de res', price: '$6,00', size: 'Entero' },
            { name: 'Chaulafán especial', price: '$6,25', size: 'Entero', desc: 'Camarón, pollo y chancho' },
            { name: 'Chaulafán súper especial', price: '$8,25', size: 'Entero' },
        ],
    },
    {
        name: 'Tallarín',
        items: [
            { name: 'Tallarín agridulce', price: '$7,25', size: 'Entero' },
            { name: 'Tallarín de pollo', price: '$6,75', size: 'Entero' },
            { name: 'Tallarín de res', price: '$6,75', size: 'Entero' },
            { name: 'Tallarín especial', price: '$6,75', size: 'Entero', desc: 'Pollo, chancho y camarón' },
            { name: 'Tallarín chop suey', price: '$8,25', size: 'Entero', desc: 'Carnes y mariscos' },
        ],
    },
    {
        name: 'Plancha',
        items: [
            { name: 'Plancha de pollo', price: '$6,75' },
            { name: 'Plancha de res', price: '$6,75' },
            { name: 'Plancha especial', price: '$7,25' },
            { name: 'Plancha con mariscos', price: '$8,25' },
            { name: 'Plancha de camarón', price: '$8,25' },
        ],
    },
    {
        name: 'Mariscos',
        items: [
            { name: 'Camarón tamarindo', price: '$9,50' },
            { name: 'Camarón agridulce', price: '$9,50' },
            { name: 'Gran chop suey', price: '$9,25' },
            { name: 'Camarón reventado', price: '$9,50' },
            { name: 'Mariscos verduras', price: '$8,25' },
        ],
    },
    {
        name: 'Mixtos',
        items: [
            { name: 'Mixto súper especial', price: '$8,75', desc: 'Camarón, pollo, chancho y res' },
            { name: 'Mixto de mariscos', price: '$9,25' },
            { name: 'Mixto camarón', price: '$9,25' },
            { name: 'Mixto especial', price: '$8,25', desc: 'Camarón, pollo y chancho' },
        ],
    },
    {
        name: 'Chaufarín',
        items: [
            { name: 'Chaufarín Personal', price: '$4,75', desc: 'Personaliza con tu proteína favorita' },
            { name: 'Chaufarín Entero', price: '$8,25' },
        ],
    },
];

// ─── Imágenes personalizadas para la grilla de experiencia ───
const EXPERIENCE_IMAGES: ExperienceImage[] = [
    { index: 0, url: '/images/chifa-tianjin/chaulafan.jpg' },
    { index: 1, url: '/images/chifa-tianjin/tallarin.jpg' },
    { index: 2, url: '/images/chifa-tianjin/plancha.jpg' },
    { index: 3, url: '/images/chifa-tianjin/mariscos.jpg' },
    { index: 4, url: '/images/chifa-tianjin/chaulafan.jpg' },
    { index: 5, url: '/images/chifa-tianjin/tallarin.jpg' },
];

// ─── Slides del Hero ───
const SLIDES = [
    { id: '1', title: 'CHIFA TIANJIN', description: 'EL AUTÉNTICO SABOR QUE TE TRANSPORTA', portada_desktop: '/images/chifa-tianjin/chaulafan.jpg', portada_movil: '/images/chifa-tianjin/chaulafan.jpg', active: true },
    { id: '2', title: 'SABOR Y TRADICIÓN', description: 'PORCIONES GENEROSAS, CALIDAD PREMIUM 🥢', portada_desktop: '/images/chifa-tianjin/tallarin.jpg', portada_movil: '/images/chifa-tianjin/tallarin.jpg', active: true },
    { id: '3', title: 'A LA PLANCHA', description: 'EXPERIENCIA SIZZLING ÚNICA 🔥', portada_desktop: '/images/chifa-tianjin/plancha.jpg', portada_movil: '/images/chifa-tianjin/plancha.jpg', active: true },
    { id: '4', title: 'MARISCOS FRESCOS', description: 'DEL MAR A TU MESA CON EL MEJOR SAZÓN 🦐', portada_desktop: '/images/chifa-tianjin/mariscos.jpg', portada_movil: '/images/chifa-tianjin/mariscos.jpg', active: true },
];

export default function ChifaTianjinLanding() {
    const data = {
        nombre_negocio: 'Chifa Tianjin',
        profesion: 'Restaurante de Comida China-Ecuatoriana 🥢',
        bio: 'Bienvenidos a Chifa Tianjin, donde la tradición milenaria se fusiona con el sabor ecuatoriano. Disfruta de una experiencia gastronómica premium con porciones generosas.',
        slug: 'chifa-tianjin',
        video_url: 'https://www.youtube.com/embed/eAMChMb2oyc',
        google_maps_url: 'https://share.google/yQHFXl1gmVu1NLx5b',
        instagram: 'https://www.instagram.com/chifatianjin/',
        whatsapp: 'https://wa.me/c/593939105745',
        facebook: 'https://www.facebook.com/chifatianjin/',
        tiktok_url: 'https://tiktok.com/@chifatianjin',
        rating: 4.4,
        reviews: 45,
        testimonio_destacado: 'La comida es buena si buscas un chaulafán sustancioso, los precios son cómodos y en relación a la cantidad están muy bien.',
        productos_servicios: '🍚 Chaulafán\n🍜 Tallarín\n🔥 Plancha\n🦐 Mariscos\n🍛 Mixtos\n🍲 Chaufarín',
        foto_url: '/images/chifa-tianjin/chaulafan.jpg',
    };

    return (
        <DemoBuilder
            template="hedkandi"
            data={data}
            slides={SLIDES}
            experienceImages={EXPERIENCE_IMAGES}
            kit={{
                id: 'restaurant',
                props: {
                    menuCategories: MENU_CATEGORIES,
                    accentColor: '#dc2626',
                    menuTitle: 'NUESTRA CARTA',
                    menuCtaText: 'ORDENAR POR WHATSAPP',
                },
            }}
            vcfUrl="/vcards/chifa-tianjin.vcf"
        />
    );
}
