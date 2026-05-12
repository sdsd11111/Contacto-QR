---
name: animated-web-objetivo
description: >
  Guía maestra para construir páginas web animadas de nivel profesional usando
  Next.js + Tailwind CSS + Framer Motion + GSAP. Usar siempre que se pida una
  landing page, página de ventas, hero section, bloque de precios o cualquier
  componente web que requiera animaciones de scroll, transiciones, efectos de
  entrada, parallax, glassmorphism o micro-interacciones. No usar para páginas
  estáticas sin animación o componentes puramente funcionales sin UI visual.
---

# SKILL: Páginas Web Animadas Pro — Stack OBJETIVO

**Stack base:** Next.js 14+ (App Router) · Tailwind CSS · Framer Motion · GSAP + ScrollTrigger  
**Nivel:** Intermedio → Avanzado  
**Contexto:** Clientes del ecosistema OBJETIVO (ActivaQR, Aquatech, primerreporte, etc.)

---

## 1. PRINCIPIOS DE ANIMACIÓN PRO

1. **Propósito primero** — cada animación debe guiar la atención o reforzar el mensaje.
2. **Performance 60fps** — usar solo `transform` y `opacity`. Nunca `height`, `width`, `top`, `left`.
3. **Jerarquía de movimiento** — lo más importante entra primero.
4. **Reducción de movimiento** — siempre incluir `prefers-reduced-motion`.
5. **Mobile primero** — animaciones complejas en mobile deben reducirse si afectan el LCP.

---

## 2. INSTALACIÓN

```bash
npm install framer-motion gsap @gsap/react
```

### GSAP en Next.js (App Router)

```tsx
// app/providers.tsx
'use client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

---

## 3. PATRONES REUTILIZABLES

### 3.1 FadeIn al scroll

```tsx
'use client'
import { motion } from 'framer-motion'
const dirs = { up:{y:40,x:0}, down:{y:-40,x:0}, left:{x:40,y:0}, right:{x:-40,y:0} }
export function FadeIn({ children, delay=0, direction='up', className='' }) {
  return (
    <motion.div
      initial={{ opacity:0, ...dirs[direction] }}
      whileInView={{ opacity:1, x:0, y:0 }}
      viewport={{ once:true, margin:'-80px' }}
      transition={{ duration:0.6, delay, ease:[0.22,1,0.36,1] }}
      className={className}
    >{children}</motion.div>
  )
}
```

### 3.2 StaggerList — lista en cascada

```tsx
const container = { hidden:{}, show:{ transition:{ staggerChildren:0.12, delayChildren:0.2 } } }
const item = { hidden:{opacity:0,y:30}, show:{opacity:1,y:0,transition:{duration:0.5,ease:[0.22,1,0.36,1]}} }
export function StaggerList({ items }) {
  return (
    <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}}>
      {items.map((item,i) => <motion.li key={i} variants={item}>{item}</motion.li>)}
    </motion.ul>
  )
}
```

### 3.3 Contador animado (GSAP)

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
export function AnimatedCounter({ end, prefix='', suffix='', duration=2 }) {
  const ref = useRef(null)
  useEffect(() => {
    const counter = { val: 0 }
    ScrollTrigger.create({
      trigger: ref.current, start:'top 85%', once:true,
      onEnter: () => gsap.to(counter, { val:end, duration, ease:'power2.out',
        onUpdate: () => { ref.current.textContent = `${prefix}${Math.round(counter.val)}${suffix}` }
      })
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [end])
  return <span ref={ref}>{prefix}0{suffix}</span>
}
```

### 3.4 RadarBackground — Hero ActivaQR

```tsx
export function RadarBackground() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {[1,2,3,4].map(i => (
        <span key={i} className="absolute rounded-full border border-primary/20"
          style={{ width:`${i*180}px`, height:`${i*180}px`,
            animation:`ping ${1.8+i*0.6}s cubic-bezier(0,0,0.2,1) infinite`,
            animationDelay:`${i*0.5}s`, opacity:1/(i+1) }}
        />
      ))}
    </div>
  )
}
// globals.css:
// @keyframes ping { 0%{transform:scale(0.8);opacity:0.6} 70%{transform:scale(1.4);opacity:0.1} 100%{transform:scale(1.6);opacity:0} }
```

### 3.5 GlassCard — Glassmorphism premium

```tsx
export function GlassCard({ children, className='' }) {
  return (
    <div className={`rounded-[3.5rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  )
}
```

### 3.6 BlinkingBadge — "Punto Ciego Detectado"

```tsx
export function BlinkingBadge({ text }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-mono text-red-400 tracking-widest uppercase">{text}</span>
    </div>
  )
}
```

### 3.7 Micro-interacciones de botones

```tsx
// Botón primario
<motion.button whileHover={{scale:1.03,y:-2}} whileTap={{scale:0.97}}
  transition={{type:'spring',stiffness:400,damping:20}}
  className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold">
  Quiero saberlo →
</motion.button>

// Botón fantasma
<motion.button whileHover={{backgroundColor:'rgba(255,255,255,0.08)'}} whileTap={{scale:0.97}}
  className="border border-white/30 text-white px-8 py-4 rounded-2xl">
  Ver garantía
</motion.button>
```

---

## 4. ESTRUCTURA DE LANDING — ORDEN DE BLOQUES

| Bloque | Componente | Fondo | Animación |
|--------|-----------|-------|-----------|
| Hero | RadarBackground + H1 | Oscuro `#050505` | FadeIn secuencial + ping |
| Dolor (Imagina) | StaggerList | Oscuro | Cascada al scroll |
| Costo Real | GlassCard sobre img B&W | Fullscreen img oscurecida | FadeIn + scale |
| Objeción | Texto plano | **Crema claro** `#f5f3ef` | Sin animación (intencional) |
| Solución | 3 pasos + GlassCard | Oscuro con overlay | StaggerList horizontal |
| Presentación | Cards con íconos | Gris oscuro `#0a0a0a` | FadeIn stagger |
| Precios | Cards jerárquicas | Oscuro | FadeIn stagger |
| Cierre/Garantía | CTA + badge | Oscuro sólido | FadeIn + pulse |

### REGLA DE CONTRASTE: Alternar siempre oscuro → claro → oscuro
No encadenar más de 2 bloques del mismo tono. El ojo necesita respiro.

---

## 5. PALETA DE EASINGS PRO

```ts
export const EASINGS = {
  smooth:  [0.22, 1, 0.36, 1],    // entrada suave, salida firme — el más usado
  snappy:  [0.32, 0, 0.67, 0],    // rápido al inicio
  elastic: { type:'spring', stiffness:300, damping:20 },
  stiff:   { type:'spring', stiffness:500, damping:30 },
}
```

---

## 6. TIPOGRAFÍA PREMIUM — REGLAS OBLIGATORIAS

- **Sentence Case** en TODOS los H1 y H2. NUNCA todo en mayúsculas.
- Tamaños: H1 `clamp(2.5rem, 7vw, 5rem)` · H2 `clamp(2rem, 5vw, 3.5rem)`
- Leading: H1 `leading-[0.92]` · H2 `leading-[0.95]` · Body `leading-relaxed`
- Peso: Títulos `font-black` · Subtítulos `font-bold` · Body `font-medium`
- Fuente: `Inter` o `Montserrat` — nunca defaults del sistema

---

## 7. CHECKLIST ANTES DE ENTREGAR

- [ ] Todas las animaciones tienen `viewport={{ once: true }}`
- [ ] GSAP tiene cleanup (`return () => tl.kill()`) en cada `useEffect`
- [ ] Botones tienen `whileTap` además de `whileHover`
- [ ] Header/footer ocultos si es landing standalone (`LayoutWrapper`)
- [ ] Contraste oscuro/claro alternado entre bloques
- [ ] Tipografía en Sentence Case
- [ ] Probado en mobile (Chrome DevTools responsive)

---

## 8. RECURSOS

| Recurso | URL |
|--------|-----|
| Framer Motion | https://www.framer.com/motion |
| GSAP ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger |
| Aceternity UI | https://ui.aceternity.com |
| Magic UI | https://magicui.design |
| Easings | https://easings.net |
