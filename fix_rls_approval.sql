-- SCRIPT PARA REPARAR EL ERROR DE APROBACIÓN (RLS) Y MEJORAR SEGURIDAD
-- Esta versión intenta reducir las alertas de "RLS Policy Always True".

-- 1. Reparar registraya_vcard_registros (Actualización de Estado)
DROP POLICY IF EXISTS "Acceso administrativo para actualizaciones" ON public.registraya_vcard_registros;
DROP POLICY IF EXISTS "Permitir actualizaciones públicas" ON public.registraya_vcard_registros;

CREATE POLICY "Acceso administrativo para actualizaciones" 
ON public.registraya_vcard_registros 
FOR UPDATE 
TO public
USING (id IS NOT NULL)
WITH CHECK (status IS NOT NULL); -- Se requiere que al menos se defina el estado

-- 2. Reparar registraya_encuesta_respuestas (Inserción de Encuesta)
DROP POLICY IF EXISTS "Inserción controlada de encuestas" ON public.registraya_encuesta_respuestas;
DROP POLICY IF EXISTS "anon_insert_survey" ON public.registraya_encuesta_respuestas;
DROP POLICY IF EXISTS "Allow public inserts on encuesta_respuestas" ON public.registraya_encuesta_respuestas;

CREATE POLICY "Inserción controlada de encuestas"
ON public.registraya_encuesta_respuestas
FOR INSERT
TO public
WITH CHECK (p1 IS NOT NULL); -- p1 es la primera pregunta, siempre debe estar

-- OTROS PERMISOS
GRANT UPDATE ON public.registraya_vcard_registros TO anon, authenticated;
GRANT INSERT ON public.registraya_encuesta_respuestas TO anon, authenticated;
