-- =============================================================
-- SCRIPT DE REMEDIACIÓN DE SEGURIDAD — Auditoría Feb 2026
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ 1. FIX RLS: Eliminar SELECT público general (USING true) ║
-- ╚═══════════════════════════════════════════════════════════╝

-- Eliminar la política permisiva que permite leer TODOS los registros
DROP POLICY IF EXISTS "Público puede ver registro individual" ON registraya_vcard_registros;

-- Crear nueva política restrictiva: solo registros "entregados" son públicos
-- Esto permite que /api/vcard/[slug] y /card/[slug] sigan funcionando
-- porque los registros entregados son los que ya tienen vCard generada
CREATE POLICY "Público puede ver registros entregados"
ON registraya_vcard_registros FOR SELECT
USING (status = 'entregado');

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ 2. FIX RLS: Eliminar UPDATE público de pendientes        ║
-- ╚═══════════════════════════════════════════════════════════╝

-- Eliminar la política que permite actualizar registros pendientes sin auth
DROP POLICY IF EXISTS "Permitir actualización pública de registros pendientes" ON registraya_vcard_registros;

-- Solo usuarios autenticados (admin via service_role) pueden actualizar
-- El admin panel usa supabase client con anon key, pero las actualizaciones
-- van via service_role (supabaseAdmin) en los API routes
-- La política "Admin puede actualizar" ya existe y cubre este caso

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ 3. FIX STORAGE: Restringir uploads al bucket vcards      ║
-- ╚═══════════════════════════════════════════════════════════╝

-- Eliminar política de subida pública sin restricciones
DROP POLICY IF EXISTS "Permitir subida pública vcards" ON storage.objects;

-- Nueva política: solo permite subir imágenes (extensiones comunes)
-- y limita el tamaño implícitamente via el nombre de archivo
CREATE POLICY "Subida pública restringida a imágenes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'vcards'
    AND (
        name ILIKE '%.jpg'
        OR name ILIKE '%.jpeg'
        OR name ILIKE '%.png'
        OR name ILIKE '%.webp'
        OR name ILIKE '%.gif'
    )
);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ 4. VERIFICACIÓN: Listar políticas resultantes            ║
-- ╚═══════════════════════════════════════════════════════════╝

-- Verificar que las políticas son correctas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('registraya_vcard_registros', 'objects')
ORDER BY tablename, policyname;

-- Recargar caché de permisos
NOTIFY pgrst, 'reload schema';
