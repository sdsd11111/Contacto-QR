---
name: ActivaQR Architecture (DNA)
description: Technical architecture, database schema, and core workflows for the ActivaQR (vcard-app) project. Use this as the source of truth for understanding the system's "DNA".
---

# ActivaQR Architecture & DNA (v6 — Feb 2026)

Este documento es la **fuente de verdad técnica** para el proyecto ActivaQR. Documenta cómo interactúan los componentes, la estructura de la base de datos y los flujos críticos.

## 🛠️ Stack Tecnológico Core

| Capa | Tecnología |
|---|---|
| **Frontend** | Next.js 16 (App Router) + React 19 |
| **Estilos** | Tailwind CSS 4 + Framer Motion (Animaciones) |
| **Base de Datos** | MySQL (Shared Hosting / cPanel via `mysql2/promise`) |
| **IA / ML** | OpenAI Whisper (Transcripción) + GPT-4o-mini (Extracción) |
| **Email** | Nodemailer (Centralizado en `lib/mailer.ts`) |

---

## 🗄️ Base de Datos (MySQL)

El sistema utiliza el prefijo `registraya_vcard_` para sus tablas.

### 1. `registraya_vcard_sellers` (Vendedores)
Gestiona la red de mercadeo y jerarquías.
- `id`: Identificador único.
- `parent_id`: ID del líder (soporta multinivel).
- `codigo`: Código de referido (ej: "001").
- `comision_porcentaje`: Porcentaje asignado (Sub-vendedor 30%, Líder variable).
- `role`: admin, leader, seller.

### 2. `registraya_vcard_registros` (Clientes/vCards)
Datos de las tarjetas generadas y estado de pago.
- `status`: 'pendiente', 'pagado'.
- `auto_email_sent`: Booleano (1/0) para control de la cola de correos.
- `paid_at`: Timestamp de pago.
- **Política de Pago**: Ya no se permite el registro "Fiado". Todo registro nuevo debe ser marcado como `pagado`.
- **Marca de Agua**: Toda vCard pública y archivo .vcf debe incluir el texto *"Creado por www.activaqr.com"*.

### 3. `registraya_vcard_field_visits` (Mapa de Rutas)
- `foto_url`: (OPCIONAL) URL de la imagen de la fachada o visita guardada en Supabase Storage.

---

## 📧 Sistema de Email (Módulo `lib/mailer.ts`)

### Centralización
Toda la lógica de envío debe pasar por `sendMail()` en `lib/mailer.ts`. NO crear transporters locales.

### Reglas Críticas para Serverless (Vercel)
1. **Await Obligatorio**: En entornos serverless, siempre usar `await sendMail(...)`. El patrón fire-and-forget (`.catch()`) falla porque Vercel mata el proceso al retornar la respuesta.
2. **Sanitización**: El módulo limpia automáticamente comillas (`"`) y espacios de las variables SMTP para evitar errores de autenticación 535.
3. **Diagnóstico**: `/api/admin/test-smtp` es la herramienta oficial para probar la conexión en producción.

## 🤖 Inteligencia Artificial (Arquitectura CRM v2 y Ventas)

### 1. Arquitectura Desacoplada (Vercel + Render)
Para evitar bloqueos (Timeouts de 10s en Vercel) y múltiples ejecuciones paralelas por mensajes rápidos:
- **Ingesta (Vercel)**: El Webhook de Evolution API (`app/api/webhook/whatsapp/route.ts`) solo ENCOLA los mensajes en la tabla `registraya_whatsapp_message_queue`. No llama a la IA.
- **Procesamiento (Render)**: Un Background Worker ejecutado con TypeScript puro (`tsx ./scripts/message-worker.ts`) corre de forma persistente.
- **Acumulación (Debounce 25s)**: El Worker espera 25 segundos desde el último mensaje de un usuario para concatenar todos los mensajes (ideas fragmentadas) en un solo "pensamiento" antes de enviarlo a OpenAI.

### 2. Psicología de Ventas en la IA (El "Closer")
El bot (`lib/openai-bot.ts`) no es un simple informante, es una máquina estructurada de ventas:
- **Cierre Presuntivo (Amarre)**: Cuando detecta alta intención (pedir proyecciones matemáticas o hablar de métodos de pago), NUNCA hace el handoff de forma directa. Hace que el usuario dé el **"Sí"** con preguntas cerradas (ej. "¿Te gustaría que César te haga una propuesta?").
- **Handoff Post-Sí**: Solo cuando el usuario acepta, el bot se despide definitivamente y usa el tag `[TRANSFER_RESELLER]`, sin caer en bucles de más preguntas.
- **Prevención de Falsos Positivos**: Discutir precios o ganancias NO se cataloga como "Enojo", sino como "Alta Intención", lo que fuerza un `puntuacion_calidad` (Lead Score) de 8, 9 o 10.
- **Humanización (Multi-Bubble)**: La IA usa la etiqueta silenciosa `[SPLIT]` para separar párrafos largos. El Worker intercepta esto y envía múltiples burbujas de WhatsApp con una pausa artificial de "Escribiendo..." (1.5s) entre cada una.

---

## ⚙️ Flujos de Trabajo (Core Workflows)

### 1. Proceso de Registro y Pago
- El usuario llena el `RegisterWizard.tsx`.
- Se integra con PayPal / PayPhone.
- Al pagar, el registro se marca como `status = 'pagado'`.

### 2. Cola de Correos (Cron Job)
- Endpoint: `/api/admin/cron/process-delayed-emails`.
- **Lógica**: Busca registros pagados donde `auto_email_sent = 0` y el tiempo transcurrido es mayor al intervalo configurado.
- **Intervalo**: Configurable en el SQL del cron (Ej: `INTERVAL 1 MINUTE` en pruebas, `24 HOUR` en producción).

### 3. Gestión de Jerarquías y Comisiones
- **Niveles**: 30% (Base), 40% (Plata), 50% (Oro).
- **Cálculo de Tiers**: Estrictamente por **Mes Calendario**. Se reinicia el primer día de cada mes.
- **VVP Estricto**: Para ganar diferenciales de equipo, un líder debe cumplir su cuota personal en el mes actual.

### 4. Asistente de Entrevista con IA
- **Endpoint**: `/api/transcribe-interview`.
- **Lógica**: Toma un audio del vendedor, lo transcribe con Whisper y usa GPT para extraer un objeto JSON con `bio`, `products` y `etiquetas` SEO optimizadas.
- **UX**: Integrado en `SupportModal.tsx` y en el `DirectVCardRegistration.tsx`.

---

## 🔐 Seguridad y Autenticación

- **Admin API Key**: Protege los endpoints sensibles (`/api/admin/*`) mediante el header `x-admin-key`.
- **Variables de Entorno**: Almacenadas en Vercel y `.env.local`. Nunca exponer `SMTP_PASS` en el cliente.

---

## 🎨 Guía de Marca
Referencia rápida:
- **Principal (CTAs)**: Tomate ActivaQR (`#f66739`)
- **Éxito (Acentos)**: Verde (`#66bf19`)
- Referencia completa: `./.agent/skills/branding/SKILL.md`
