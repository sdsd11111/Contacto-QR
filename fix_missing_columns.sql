-- Fix missing columns for the new Supabase project
-- Run this in the Supabase SQL Editor

ALTER TABLE registraya_vcard_registros
ADD COLUMN IF NOT EXISTS galeria_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS web TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT;
