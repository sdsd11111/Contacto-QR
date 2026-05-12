# 🧠 Manual: AdvancedFAQ (FAQ con Esteroides)

Este componente es el heredero de la arquitectura de venta cara-a-cara de ActivaQR. No es un listado de preguntas; es un **motor de conversión** que mezcla validación social, contenido multimedia y CTAs tácticos.

## 🛠️ Estructura de Props

El componente acepta las siguientes propiedades principales:

| Prop | Tipo | Descripción |
| :--- | :--- | :--- |
| `items` | `FAQItem[]` | Array de objetos con la data de cada pregunta. |
| `title` | `ReactNode` | Título principal (soporta JSX para itálicas o colores). |
| `subtitle` | `string` | Párrafo descriptivo bajo el título. |
| `sectionTag`| `string` | Etiqueta superior (ej: "Sin textos aburridos"). |

### 📄 Objeto `FAQItem`

```typescript
{
    id: string;               // Identificador único
    tag: string;              // Categoría corta (ej: "USABILIDAD")
    q: string;                // La pregunta (Título)
    bullets: string[];        // Lista de beneficios/respuestas
    videoSourceType?: 'bunny' | 'youtube';
    videoUrl?: string;        // ID de video (UUID para Bunny o ID para YouTube)
    audioUrl?: string;        // URL o flag para mostrar el placeholder de audio
    ctaText?: string;         // Texto del botón de compra (si no existe, no se muestra)
}
```

## 🎥 Uso de Video y Audio

### Video (Vertical 9:16)
El componente formatea automáticamente el video dentro de un frame de "celular premium".
- **BunnyNet**: Solo pasa el UUID. El componente ya conoce el `LibraryID`.
- **YouTube**: Pasa el ID del video.

### Audio (Próximamente)
Si se provee un `audioUrl`, se activará un placeholder con una animación de onda y un icono de micrófono. Esto sirve para generar expectativa de respuestas personalizadas por voz.

## 🎨 Guía de Estilo (ADN)
- **Títulos**: Siempre en *Sentence case* (Mayúscula solo al inicio), a menos que el diseño maestro de la Home indique lo contrario.
- **Micro-animaciones**: Utiliza `framer-motion` para el layout dinámico. Evita efectos que ralenticen la carga.

---
*Mantenido por el Córtex Maestro - ActivaQR 2024*
