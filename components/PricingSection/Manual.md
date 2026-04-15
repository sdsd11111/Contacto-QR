# 💰 Manual: PricingSection (Carrusel de Inversión)

Este componente gestiona la visualización de los planes de ActivaQR, adaptándose dinámicamente al contexto de la página mediante el resaltado de planes específicos y un comportamiento móvil optimizado.

## 🛠️ Estructura de Props

| Prop | Tipo | Descripción |
| :--- | :--- | :--- |
| `initialPlanId` | `string` | ID del plan que debe aparecer primero/centrado al cargar (ej: 'digital'). |
| `onQuoteClick` | `function` | Callback para abrir el modal de cotización (usado en el plan Web). |

## 📱 Comportamiento Móvil (Carrusel)

En resoluciones menores a `768px`, el componente transforma el grid en un carrusel horizontal:
- **Snap**: Las tarjetas se "imanan" al centro de la pantalla.
- **Scroll Infinito (Visual)**: Aunque la data es finita, el scroll es fluido y utiliza `scrollbar-hide` para una experiencia tipo App.
- **Indicadores**: Puntos dinámicos en la base que reflejan el plan activo.

## 🎨 Ajustes de Diseño (ADN)

- **Glassmorphism**: Las tarjetas utilizan `backdrop-blur-[30px]` y gradientes internos para asegurar la legibilidad sobre las imágenes de fondo.
- **Sentence Case**: Títulos y subtítulos deben seguir la regla de mayúscula inicial, evitando el uso excesivo de All-Caps que distorsione la elegibilidad premium.
- **Glow**: El plan que tenga `isFeatured: true` en la data recibirá un anillo (`ring`) de luz primario para captar la atención.

## 🔄 Actualización de Datos

Para cambiar precios, descripciones o imágenes, edita el archivo:
`@/constants/planes.tsx`

---
*Mantenido por el Córtex Maestro - ActivaQR 2024*
