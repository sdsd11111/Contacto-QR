---
name: Hero UI Standard
description: "Estándar de diseño y proporciones UX para los Hero Sections (inicio de página) en ActivaQR. Debe usarse siempre para reemplazar o crear cualquier página nueva, garantizando legibilidad y consistencia con el Home."
---

# Hero UX/UI Standard (V1 - April 2026)

This skill defines the strict visual proportions and Tailwind CSS classes layout required for ANY Hero Section (the top landing area) across the ActivaQR platform, based on the highly-converting `HomeClient.tsx` layout.

## 1. Contenedor Principal (The Wrapper)
**Rule:** NEVER use strict `h-screen` if the content is dense. ALWAYS use `min-h-screen` combined with `flex items-center` to allow natural growth on smaller devices without overlapping the fixed header.
```tsx
<section className="relative min-h-screen w-full overflow-hidden flex items-center bg-cream">
   {/* Background Image Absolute Code Here */}
</section>
```

## 2. Contenedor de Contenido (The Safe Area)
**Rule:** Prevent header overlap mathematically by using thick vertical padding (`py-20 lg:py-32`) instead of hardcoded `pt-` spacing hacks.
```tsx
<div className="container mx-auto relative z-20 px-6 md:px-12 py-20 lg:py-32">
    {/* Glassmorphism Box */}
</div>
```

## 3. Tarjeta de Cristal (Glassmorphism Box)
**Rule:** The text block must always inhabit a `max-w-3xl` box with generous `p-8 md:p-12` padding. Never squash it.
```tsx
<motion.div 
    className="max-w-3xl bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[3.5rem] border border-white/40 shadow-2xl shadow-navy/5"
>
```

## 4. Tipografía Estandarizada
**Rule:** Do NOT use `text-7xl` or `text-8xl` for long headlines, it destroys mobile/laptop UX.
*   **H1:** `text-3xl md:text-5xl lg:text-6xl font-black text-navy leading-[1.05] tracking-tighter`
*   **Párrafo Subtítulo:** `text-base md:text-lg text-navy/70 mb-10 leading-relaxed font-medium max-w-xl`

## 5. Botones (CTAs)
**Rule:** Buttons follow the "Chunky & Audible" rule. They must be large and inviting.
*   **Primary/Secondary CTA:** `px-10 py-6 rounded-full font-black text-xl`

> [!WARNING]
> If a user requests "make it fullscreen", ensure you use `min-h-screen`, and NEVER sacrifice the typography scaling rules described here. A crowded `h-screen` causes vertical clipping.
