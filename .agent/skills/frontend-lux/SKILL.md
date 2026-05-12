---
name: Frontend UX Expert
description: Guía maestra de diseño, proporciones y reglas de implementación UI para ActivaQR. Enfocado en estética premium, legibilidad y consistencia entre páginas.
---

# Frontend UX Expert Standard (v1.1 - 2026)

Este sistema de reglas debe seguirse estrictamente para asegurar que ActivaQR se sienta como un producto de lujo, consistente y funcional.

## 📏 1. Arquitectura del Hero (Regla de Oro)
**Prohibición de `h-screen` estricto:** NUNCA usar `h-screen` para secciones con mucho texto. Usar siempre `min-h-screen` con `flex items-center`. Esto evita que el contenido se "aplace" o sobreponga al Header en pantallas de laptops o tablets.

**Estructura Base:**
```tsx
<section className="relative min-h-screen w-full overflow-hidden flex items-center bg-cream">
   {/* Background & Overlays */}
</section>
```

## 🔠 2. Tipografía y Capitalización
**La Regla del Sentence Case:** Los titulares (H1) y subtítulos deben usar **Sentence Case** (Mayúscula solo en la primera letra y nombres propios), NUNCA All-Caps sostenido, a menos que sea para una etiqueta específica de UI (Badges).
- ✅ "No más tarjetas en la basura." (Sentence Case - Elegante, humano)
- ❌ "NO MAS TARJETAS EN LA BASURA." (All Caps - Agresivo, genérico)

> [!TIP]
> Solo usar All-Caps en **Badges** (pequeños rótulos) o etiquetas de categoría muy cortas para generar contraste visual, nunca en frases de más de 3 palabras.

## 💎 3. Glassmorphism y Elevación
Todas las cajas de contenido sobre fondo imagen deben usar:
- `bg-white/40` o `bg-navy/40` dependiendo del contraste.
- `backdrop-blur-xl` para profundidad.
- `rounded-[3.5rem]` para una estética suave y moderna.
- `p-12` de padding interno para que el contenido respire.
- **Sombra:** `shadow-2xl shadow-navy/5`.

## 🛡️ 4. Badges de Autoridad Internacional
**Regla Anti-Caducidad:** NUNCA usar años específicos a menos que sea un "Award" real.
- **Badge Estándar:** `IDENTIDAD DIGITAL • VCARD 3.0`.
- **Estructura React:** 
```tsx
<div className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full shadow-lg mb-8">
    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
    <span className="text-[10px] font-black uppercase tracking-widest">Identidad Digital • vCard 3.0</span>
</div>
```

## 🤝 5. Sección de Confianza (Cards de Beneficios)
Para las secciones de "Tu identidad", usar una grilla de 2 columnas (Lg) con:
- Columna 1: Tarjetas de beneficio con iconos (`Smartphone`, `Users`).
- Columna 2: Imagen de alta calidad (`v2_contacto_guardado.webp`) con efecto de brillo/glow detrás (`bg-primary/20 blur-[100px]`).


## 📱 5. Optimización Mobile
- Los botones deben tener `py-6` en mobile para facilidad de toque (Fat Finger Rule).
- Si hay más de 2 elementos en una sección de precios, usar **Slides/Carrusel** en lugar de lista vertical infinita.

> [!IMPORTANT]
> **Consistencia:** Si cambias una proporción en una landing, DEBES verificar si esa misma proporción debe ser replicada en el `HomeClient.tsx` para mantener el "ADN" del sitio.
