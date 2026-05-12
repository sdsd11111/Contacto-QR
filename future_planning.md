# Plan de Mejoras Futuras / Roadmap

Este documento recopila las ideas y requerimientos estratégicos para las próximas fases del proyecto, basados en las directrices del usuario (Audios 13/02/2026).

## 1. Sistema de Afiliados/Vendedores
**Objetivo:** Escalar las ventas a través de una fuerza de ventas externa sin acceso al panel administrativo.
- **ID de Vendedor:** Cada vendedor tendrá un identificador único.
- **Formulario Personalizado:** Los vendedores utilizarán un formulario de registro que capture su ID (o un enlace con parámetro de seguimiento).
- **Comisiones:** 
    - Comisión del 50% por venta ($10.00 por cada vCard vendida).
- **Control:** Seguimiento riguroso en la base de datos para atribuir ventas y gestionar pagos de comisiones.

## 2. Campañas de Renovación Anticipada
**Objetivo:** Generar liquidez inmediata incentivando renovaciones a largo plazo.
- **Ofertas Flash:** Campañas estacionales (ej. Día de la Madre).
- **Promoción Multi-año:** 50% de descuento si el cliente renueva por 3 years consecutivos ($15.00 total por los 3 años en lugar de $30.00).
- **Interfaz:** Pop-ups en el sitio o mensajes personalizados para clientes existentes.

## 3. Refinamiento del Sistema de Expiración (Recordatorio)
**Objetivo:** Asegurar que los servicios dejen de funcionar si no hay renovación.
- **Bloqueo de Descarga:** Al cumplirse el año, el escaneo del código QR debe detectar la expiración y bloquear la descarga del archivo vCard (.vcf).
- **Notificaciones:** Integrar con el sistema de mensajes para alertar sobre la fecha de vencimiento.

## 4. Estrategia de Mensajes y Pop-ups
**Objetivo:** Incrementar la conversión mediante comunicación directa.
- **Generación de Mensajes:** Envío de ofertas personalizadas a la base de datos de clientes.
- **Modificaciones de DB:** Preparar la base de datos para registrar estados de campañas, activaciones de pop-ups y métricas de conversión.
