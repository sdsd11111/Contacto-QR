-- Create a table for survey responses
CREATE TABLE IF NOT EXISTS public.registraya_encuesta_respuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    p1 TEXT,
    p2a TEXT,
    p2b TEXT,
    p3 TEXT,
    p4 TEXT,
    p5 TEXT,
    p6 TEXT,
    total_score INTEGER,
    color_semaforo TEXT,
    p3_resp_custom TEXT,
    nombre_local TEXT,
    user_metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.registraya_encuesta_respuestas ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts (for the survey)
CREATE POLICY "Allow public inserts on encuesta_respuestas" 
ON public.registraya_encuesta_respuestas 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users (admin) to read the data
CREATE POLICY "Allow authenticated read on encuesta_respuestas" 
ON public.registraya_encuesta_respuestas 
FOR SELECT 
USING (auth.role() = 'authenticated');
