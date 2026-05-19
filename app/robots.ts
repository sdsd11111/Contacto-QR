import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/api/og-image/'],
            disallow: ['/admin/', '/api/'],
        },
        sitemap: 'https://www.activaqr.com/sitemap.xml',
    }
}

