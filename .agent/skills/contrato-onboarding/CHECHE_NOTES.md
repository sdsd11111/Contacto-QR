# Notas para Cheche — Módulo de Contratos

## ✅ Contrato redactado

El contrato ya tiene texto funcional en `lib/contrato-utils.ts::generarTerminosTexto()`.
Incluye:
- Proveedor: César Augusto Reyes Jaramillo (C.I. 1103421531001)
- Vigencia: 1 año
- Cláusula de autogestión (clave de edición)
- Firmado en Loja con fecha
- Soporta múltiples productos seleccionables

**Para modificar el texto:** Editar la función `generarTerminosTexto()` en `lib/contrato-utils.ts`.

## ✅ Servicios multi-producto

El formulario ahora permite seleccionar 1 o más servicios vía checkboxes.
El total se auto-calcula según los servicios seleccionados.
Ejemplo común: digital ($35) + business ($100) = $135.

## Pendiente: Endpoint admin para generar contratos

Por ahora `POST /api/contratos/generar` es un endpoint público (solo validación básica).
Falta crear la interfaz en el panel de admin para que los asesores:
1. Seleccionen/ingresen datos del cliente
2. Seleccionen producto contratado
3. Generen UUID y copien el link

## Pendiente: Notificación por email al cliente

Después de firmar, toca implementar envío de email automático con:
- Confirmación de firma
- ID del contrato
- Snapshot del contrato (opcional, podría ser un enlace)

El sistema SMTP ya está configurado (`lib/mailer.ts`).

## Pendiente: Sección admin de contratos

Falta agregar una vista "Contratos" en el panel admin que permita:
- Listar contratos firmados
- Filtrar por estado de pago
- Ver detalle del contrato (snapshot + metadatos)
- Cambiar estado de pago
