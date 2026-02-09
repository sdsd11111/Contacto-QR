-- 1. Agregar columnas faltantes para VCard 4.0 y Admin Edit
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registraya_vcard_registros' AND COLUMN_NAME = 'facebook') THEN
        ALTER TABLE registraya_vcard_registros ADD COLUMN facebook TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registraya_vcard_registros' AND COLUMN_NAME = 'tiktok') THEN
        ALTER TABLE registraya_vcard_registros ADD COLUMN tiktok TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registraya_vcard_registros' AND COLUMN_NAME = 'productos_servicios') THEN
        ALTER TABLE registraya_vcard_registros ADD COLUMN productos_servicios TEXT;
    END IF;
END $$;

-- 2. Asegurar que las Políticas de RLS permitan la edición pública (para el Admin Dashboard)
DROP POLICY IF EXISTS "Permitir actualizaciones públicas" ON registraya_vcard_registros;
DROP POLICY IF EXISTS "Permitir actualización pública de registros pendientes" ON registraya_vcard_registros;
DROP POLICY IF EXISTS "Admin puede actualizar" ON registraya_vcard_registros;

CREATE POLICY "Permitir actualizaciones totales" 
ON registraya_vcard_registros FOR UPDATE 
TO public
USING (true) 
WITH CHECK (true);

-- Permitir lectura pública
DROP POLICY IF EXISTS "Permitir lectura pública" ON registraya_vcard_registros;
CREATE POLICY "Permitir lectura pública" 
ON registraya_vcard_registros FOR SELECT 
USING (true);

-- Permitir inserción pública (necesario para el registro)
DROP POLICY IF EXISTS "Permitir inserción pública" ON registraya_vcard_registros;
CREATE POLICY "Permitir inserción pública" 
ON registraya_vcard_registros FOR INSERT 
WITH CHECK (true);
