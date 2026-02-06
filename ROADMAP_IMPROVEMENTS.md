# Roadmap de Mejoras Post-MVP (Devil's Advocate Feedback)

Este documento detalla los puntos críticos identificados durante la fase de desarrollo inicial (MVP) que deben ser abordados para escalar la aplicación a producción de forma segura y profesional.

## 1. Seguridad y Privacidad
- [ ] **Implementar Autenticación (Supabase Auth)**: Proteger la ruta `/admin` para que solo usuarios autorizados puedan ver y editar registros.
- [ ] **Protección de Slugs**: Evitar que un registro existente sea sobrescrito por uno nuevo con el mismo slug (quitar el `upsert` abierto).
- [ ] **vCards Privadas**: Añadir una opción para que el perfil solo sea accesible vía enlace directo o contraseña, evitando el escaneo por bots.
- [ ] **Políticas RLS Estrictas**: Refinar las políticas de Supabase para que los usuarios solo puedan editar sus propios datos basándose en su `UID`.

## 2. Optimización de Performance
- [ ] **Redimensionamiento de Imágenes**: Implementar compresión y redimensionamiento de fotos en el cliente o servidor para evitar vCards de varios megabytes (Base64).
- [ ] **Lazy Loading de Galería**: Optimizar la carga de imágenes en el perfil público para mejorar el tiempo de carga inicial.

## 3. Experiencia de Usuario (UX)
- [ ] **Live Preview**: Mostrar una vista previa en tiempo real de la vCard mientras el usuario edita su perfil en el panel de administrador.
- [ ] **Feedback de OpenAI**: Añadir un sistema de "fallback" o etiquetas sugeridas por defecto si el servicio de IA falla o tarda demasiado.
- [ ] **Dashboard de Analíticas**: Mostrar cuántas veces se ha descargado el vCard o visitado el perfil.

## 4. Deuda Técnica y Estructura
- [ ] **Modularización del Admin**: Separar `app/admin/page.tsx` en componentes más pequeños (vCardTable, EditModal, PhotoUploader) y usar Custom Hooks para la lógica de datos.
- [ ] **Validación de Datos (Zod/Yup)**: Añadir validaciones robustas en el frontend y backend para evitar datos corruptos o inyecciones.
- [ ] **Manejo de Errores Global**: Implementar un sistema de notificaciones (Toasts) más profesional para errores de red o Base de Datos.

---
> [!NOTE]
> Estos puntos son esenciales para transformar el MVP en un producto comercial (SaaS) escalable.
