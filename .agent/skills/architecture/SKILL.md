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
| **Autenticación** | Custom (Basada en API Keys y tablas de Sellers) |
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

---

## 📧 Sistema de Email (Módulo `lib/mailer.ts`)

### Centralización
Toda la lógica de envío debe pasar por `sendMail()` en `lib/mailer.ts`. NO crear transporters locales.

### Reglas Críticas para Serverless (Vercel)
1. **Await Obligatorio**: En entornos serverless, siempre usar `await sendMail(...)`. El patrón fire-and-forget (`.catch()`) falla porque Vercel mata el proceso al retornar la respuesta.
2. **Sanitización**: El módulo limpia automáticamente comillas (`"`) y espacios de las variables SMTP para evitar errores de autenticación 535.
3. **Diagnóstico**: `/api/admin/test-smtp` es la herramienta oficial para probar la conexión en producción.

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

### 3. Gestión de Jerarquías
- Los líderes pueden tener sub-vendedores vinculados vía `parent_id`.
- Si un líder es eliminado, existe una lógica de "Migración de Equipo" (ver `implementation_plan.md`) para rescatar a los vendedores.

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
