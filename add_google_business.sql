-- Migration to add Google My Business column to registrations
ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS google_business TEXT;
