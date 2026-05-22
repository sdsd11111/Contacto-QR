---
name: Contrato Onboarding
description: "Módulo de Contrato y Onboarding de Cliente. Página única que permite al cliente firmar el contrato, aceptar políticas y entregar materiales — todo en una sola URL, optimizada para móvil."
---

# Módulo de Contrato y Onboarding de Cliente

## Ubicación
- **Página:** `app/contrato/[uuid]/page.tsx`
- **Componentes:** `components/contrato/`
- **API:** `app/api/contratos/`
- **Lógica:** `lib/contrato-utils.ts`
- **Migración SQL:** `scripts/migration_contratos.sql`

## ¿Qué hace?
Crea un contrato digital por cliente + producto. El cliente recibe un enlace único (`/contrato/[uuid]`) donde:
1. Llena sus datos personales
2. Revisa el contrato generado dinámicamente en tiempo real
3. Sube materiales (logo, fotos, archivos)
4. Acepta términos y política de privacidad
5. Firma digitalmente

## Arquitectura

```
/contrato/[uuid]       ← Página (Server Component - valida UUID)
  └── ContratoOnboardingClient  ← Orquestador (Client Component)
        ├── StepIndicator        ← Barra de progreso (3 pasos)
        ├── DatosForm            ← Paso 1: Datos del cliente
        ├── ContratoDinamico     ← Paso 2: Vista previa del contrato
        ├── SubidaMateriales     ← Paso 2: Acordeón de subida de archivos
        ├── DatosFacturacion     ← Paso 2: Acordeón de datos de facturación
        └── FirmaSection         ← Paso 3: Checkboxes + firma + envío
```

## API Endpoints

### `POST /api/contratos/generar`
Crea un nuevo contrato. Usado por el asesor/admin para generar el link que se enviará al cliente.
- **Body:** `{ cliente_nombre, cliente_telefono, cliente_email, servicio_contratado, monto_total, monto_anticipo }`
- **Response:** `{ contrato_id, contrato_url, datos }`

### `GET /api/contratos/[uuid]`
Obtiene datos de un contrato por UUID.
- **Response:** `{ contrato, firmado }`

### `PATCH /api/contratos/[uuid]`
Actualiza campos del contrato (auto-save del formulario). No permite modificar contratos ya firmados.

### `POST /api/contratos/[uuid]/firmar`
Firma el contrato. Guarda snapshot inmutable + metadatos forenses.
- **Body:** `{ firma_nombre, dispositivo_fingerprint, ubicacion, archivos_subidos }`
- También registra en la tabla `consentimientos` automáticamente.

## Tabla `contratos` (MySQL)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | VARCHAR(36) PK | UUID del contrato |
| `cliente_nombre` | VARCHAR(255) | Nombre del cliente |
| `cliente_negocio` | VARCHAR(255) | Nombre del negocio |
| `cliente_cedula_ruc` | VARCHAR(20) | Cédula o RUC |
| `cliente_telefono` | VARCHAR(30) | Teléfono/WhatsApp |
| `cliente_email` | VARCHAR(255) | Correo electrónico |
| `cliente_red_social` | TEXT | JSON array de enlaces a redes |
| `cliente_categorias` | TEXT | Productos/servicios que vende |
| `facturacion_ruc` | VARCHAR(20) | RUC para facturación |
| `facturacion_razon_social` | VARCHAR(255) | Razón social |
| `facturacion_direccion` | TEXT | Dirección fiscal |
| `facturacion_foto_url` | VARCHAR(500) | Foto de comprobante |
| `servicio_contratado` | ENUM | digital, business, catalogo, auditoria, web |
| `monto_total` | DECIMAL(10,2) | Monto total del servicio |
| `monto_anticipo` | DECIMAL(10,2) | Anticipo recibido |
| `estado_pago` | ENUM | pendiente, abonado, pagado |
| `snapshot_json` | LONGTEXT | Contrato completo firmado (inmutable) |
| `snapshot_hash` | VARCHAR(64) | SHA-256 del snapshot |
| `version_terminos` | VARCHAR(10) | Versión de términos al firmar |
| `firma_nombre` | VARCHAR(255) | Nombre escrito por el cliente |
| `acepta_terminos` | TINYINT(1) | Aceptación de términos |
| `acepta_privacidad` | TINYINT(1) | Aceptación de privacidad |
| `audit_id_consentimiento` | VARCHAR(36) | FK a tabla consentimientos |
| `timestamp_firma` | DATETIME(3) | Fecha/hora con milisegundos |
| `ip` | VARCHAR(45) | IP del dispositivo |
| `ubicacion_lat` | DECIMAL(10,7) | Latitud geolocalización |
| `ubicacion_lng` | DECIMAL(10,7) | Longitud geolocalización |
| `ubicacion_precision` | ENUM | exacta, ciudad, no_disponible |
| `servicios_seleccionados` | TEXT | JSON array de servicios contratados (multi-producto) |
| `dispositivo_fingerprint` | JSON | User-Agent + hardware + screen |
| `contrato_url` | VARCHAR(500) | Link único del contrato |
| `logo_url` | VARCHAR(500) | URL del logo subido |
| `fotos_url` | JSON | Array de URLs de fotos |
| `archivos_extra_url` | JSON | Array de URLs de archivos extra |
| `created_at` | DATETIME(3) | Fecha de creación |
| `updated_at` | DATETIME(3) | Fecha de última modificación |

## Metadatos Forenses (Validez Legal)
Cada contrato firmado captura automáticamente:
1. **IP** del dispositivo (header x-forwarded-for)
2. **Geolocalización** (lat/lng vía API del navegador - no bloqueante)
3. **Fingerprint del dispositivo:** platform, language, screen, hardwareConcurrency, deviceMemory, connectionType, timezone
4. **Timestamp** con milisegundos
5. **Hash SHA-256** del snapshot completo del contrato

## Flujo de uso

### 1. Asesor genera el contrato
El asesor llama a `POST /api/contratos/generar` (desde admin o endpoint directo) con los datos básicos del cliente y servicio. Obtiene un UUID y un link.

### 2. Asesor envía link al cliente
`https://activaqr.com/contrato/[uuid]` — enviado por WhatsApp.

### 3. Cliente llena el formulario
Datos personales → se reflejan en tiempo real en el contrato de abajo.

### 4. Cliente revisa contrato y sube materiales
- Expande secciones del contrato
- Sube logo (obligatorio), fotos y archivos (opcional)
- Datos de facturación (opcional)

### 5. Cliente firma
- Acepta términos y privacidad
- Escribe su nombre completo (firma digital simple)
- Se envía → se guarda snapshot + metadatos

### 6. Confirmación
El cliente ve pantalla de éxito. El contrato queda visible en DB.

## Validaciones
- **Cédula/RUC:** Algoritmo Módulo 10 (Ecuador) — `lib/contrato-utils.ts::validarCedulaEcuador()`
- **Campos obligatorios:** nombre, teléfono, email, servicio contratado
- **Logo:** obligatorio en subida de materiales
- **Firma:** mínimo 3 caracteres
- **Anti-duplicado:** un UUID no puede firmarse dos veces

## Archivos subidos (BunnyCDN)
Los archivos se almacenan en la carpeta `contratos/[uuid]/` dentro del CDN.
- Solo se suben al hacer clic en "Firmar y enviar"
- Formatos: PNG, JPG, SVG (imágenes), PDF (documentos)
- Límites: 5MB (logo), 10MB total (fotos), 10MB (archivos extra)

## Consideraciones de seguridad
- No se usa webhook externo — todo es interno en ActivaQR
- Los contratos firmados son **inmutables**: no se pueden modificar después de firmados
- El hash SHA-256 permite verificar integridad en caso de disputa
- La geolocalización es **aspiracional**: si el usuario deniega, se guarda "no_disponible"
- Auto-guardado en localStorage para evitar pérdida de datos por cierre accidental
