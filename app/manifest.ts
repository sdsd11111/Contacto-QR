import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ActivaQR - Contacto Digital',
        short_name: 'ActivaQR',
        description: 'Tu contacto profesional en 1 clic. Siempre aparece primero en el teléfono de tus clientes.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FDFCF6',
        theme_color: '#002B49',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/images/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/images/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
        shortcuts: [
            {
                name: 'Panel Administrador',
                short_name: 'Admin',
                description: 'Acceso directo al panel de gestión de vCards',
                url: '/admin',
                icons: [{ src: '/favicon.ico', sizes: '192x192' }]
            }
        ]
    }
}
