-- Script SQL para configurar la base de datos de vCards en Supabase (Proyecto RegistraYa)

-- Habilitar extensión UUID si no está (normalmente lo está)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de registros (usamos minúsculas para evitar problemas de casing)
CREATE TABLE IF NOT EXISTS registraya_vcard_registros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE, -- URL amigable ej: cesar-reyes-123
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nombre TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL, -- Clave única para Upsert
    profesion TEXT,
    empresa TEXT,
    bio TEXT,
    etiquetas TEXT,
    plan TEXT CHECK (plan IN ('basic', 'pro')),
    foto_url TEXT,
    comprobante_url TEXT,
    galeria_urls TEXT[] DEFAULT '{}', -- Galería de hasta 3 fotos adicionales
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagado', 'entregado', 'cancelado')),
    delivery_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE registraya_vcard_registros ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas
DROP POLICY IF EXISTS "Permitir inserción pública" ON registraya_vcard_registros;
DROP POLICY IF EXISTS "Admin puede ver todo" ON registraya_vcard_registros;
DROP POLICY IF EXISTS "Público puede ver registro individual" ON registraya_vcard_registros;
DROP POLICY IF EXISTS "Admin puede actualizar" ON registraya_vcard_registros;
DROP POLICY IF EXISTS "Permitir actualización pública de registros pendientes" ON registraya_vcard_registros;

-- Crear políticas
CREATE POLICY "Permitir inserción pública" 
ON registraya_vcard_registros FOR INSERT 
WITH CHECK (nombre IS NOT NULL AND email IS NOT NULL AND whatsapp IS NOT NULL);

CREATE POLICY "Permitir actualización pública de registros pendientes"
ON registraya_vcard_registros FOR UPDATE
USING (status = 'pendiente')
WITH CHECK (status = 'pendiente');

CREATE POLICY "Admin puede ver todo" 
ON registraya_vcard_registros FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Público puede ver registro individual" 
ON registraya_vcard_registros FOR SELECT 
USING (true);

CREATE POLICY "Admin puede actualizar" 
ON registraya_vcard_registros FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Indexar para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_v_registraya_email ON registraya_vcard_registros(email);
CREATE INDEX IF NOT EXISTS idx_v_registraya_whatsapp ON registraya_vcard_registros(whatsapp);
CREATE INDEX IF NOT EXISTS idx_v_registraya_status ON registraya_vcard_registros(status);
CREATE INDEX IF NOT EXISTS idx_v_registraya_slug ON registraya_vcard_registros(slug);

-- CONFIGURACIÓN DE STORAGE
-- Es vital que el bucket se llame 'vcards'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vcards', 'vcards', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el bucket 'vcards'
DROP POLICY IF EXISTS "Permitir subida pública vcards" ON storage.objects;
DROP POLICY IF EXISTS "Permitir ver archivos vcards público" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access storage" ON storage.objects;

CREATE POLICY "Permitir subida pública vcards"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vcards');

CREATE POLICY "Permitir ver archivos vcards público"
ON storage.objects FOR SELECT
USING (bucket_id = 'vcards');

CREATE POLICY "Admin full access storage"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated');

-- Función para estimar el conteo de filas (Solución a advertencia de seguridad)
-- Esta función debe tener el search_path fijo para ser segura según el linter de Supabase.
CREATE OR REPLACE FUNCTION public.count_estimate(query text)
RETURNS integer AS $$
DECLARE
    rec RECORD;
    ROWS INTEGER;
BEGIN
    FOR rec IN EXECUTE 'EXPLAIN ' || query LOOP
        ROWS := SUBSTRING(rec."QUERY PLAN" FROM ' rows=([[:digit:]]+)');
        EXIT WHEN ROWS IS NOT NULL;
    END LOOP;
    RETURN ROWS;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;
