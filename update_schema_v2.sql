-- SQL to add Facebook and TikTok fields to registraya_vcard_registros
ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS productos_servicios TEXT;
