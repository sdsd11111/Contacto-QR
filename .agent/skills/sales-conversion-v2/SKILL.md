---
name: sales-conversion-v2
description: "Guía maestra para la creación y optimización de páginas de venta y producto bajo el estándar 'Midnight Obsidian' de ActivaQR2."
version: 1.0.0
author: Antigravity
created: 2026-05-01
category: UI/UX
tags: [conversion, landing-page, dark-mode, glassmorphism]
---

# Sales Conversion V2 (Midnight Obsidian)

## Propósito
Este skill establece los estándares visuales, narrativos y técnicos para las páginas de aterrizaje de ActivaQR2 (`/contacto-digital-v2` y `/contacto-digital-producto`). Debe usarse para mantener la coherencia cinematográfica y la alta autoridad en cualquier nueva sección o página de ventas.

## Cuándo usar este skill
- Al crear una nueva landing page de producto o servicio.
- Al optimizar secciones de conversión existentes.
- Al auditar la estética "Dark Glassmorphism" y el uso del color Tomate `#FF6B2B`.

## Protocolo Visual: "Midnight Obsidian"

### 1. Paleta de Colores y Capas
- **Fondo Base**: `#0a0a0a`.
- **Bloques de Contraste**: `#050505` para secciones alternas.
- **Color de Acción**: `#FF6B2B` (solo para CTAs y estados activos).
- **Glassmorphism**: 
  - Bordes: `border-white/10`.
  - Fondos: `bg-white/5` con `backdrop-blur-md`.

### 2. El Sistema de "Pálpitos" (Surveillance UI)
Toda página de ventas debe incluir las animaciones de monitoreo para romper la monotonía:
- **RadarPing**: Anillos expansivos naranjas anclados a elementos clave.
- **ScatteredPings**: Puntos blancos dispersos con ondas de choque sutiles.
  - *Z-Index*: Debe ser `z-[5]` para estar sobre el fondo pero bajo el contenido (`z-10`).
  - *Visibilidad*: Punto central sólido blanco (`opacity: 1`) con anillos de `border-1.5px`.

### 3. Estructura de Secciones (The Sales Pipeline)
1. **Hero Cinematic**: Títulos con `AnimatedWord` (rotación de profesiones) y fondo con grano/ruido sutil.
2. **The Mirror (Narrativa)**: Uso del `ImagineSlider` para generar empatía.
3. **The Problem/Cost**: Bloques de alto contraste con tipografía `uppercase` y `tracking-tighter`.
4. **Interactive Objection Handling**: Uso del componente `ChatSequence` para simular conversaciones reales.
5. **Video Trust**: Inserción de `AdvancedFAQ` con `variant="dark"` y video-respuestas directas.

## Reglas de Implementación

### Navbar
- Debe ser una cápsula flotante (`rounded-full`) con `backdrop-blur-xl`.
- Links simplificados: Home, Producto, V2, Ventas VIP.

### Footer
- Estructura de 3 columnas minimalista.
- Texto blanco (`text-white`) para links y `text-white/40` para etiquetas descriptivas.

### FAQ
- Siempre usar el componente `AdvancedFAQ` con la prop `variant="dark"`.
- Los fondos de los acordeones deben ser translúcidos, nunca sólidos.

## Checklist de Calidad (Criterio de Aceptación)
- [ ] ¿El botón de acción principal es `#FF6B2B`?
- [ ] ¿Hay al menos dos secciones con pálpitos (Radar/Scattered)?
- [ ] ¿Se evita el uso de fondos blancos puros?
- [ ] ¿El Navbar es una cápsula flotante?
- [ ] ¿Se han reemplazado todos los placeholders por contenido real o imágenes premium?

---
*Referencia de ADN: ActivaQR2 Cinematic Landing — CopyFilms & Surveillance UI*
