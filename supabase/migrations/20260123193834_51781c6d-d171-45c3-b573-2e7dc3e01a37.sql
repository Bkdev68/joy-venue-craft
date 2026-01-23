-- Add company fields to contact_submissions
ALTER TABLE public.contact_submissions
ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'privat',
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_street text,
ADD COLUMN IF NOT EXISTS company_zip text,
ADD COLUMN IF NOT EXISTS company_city text,
ADD COLUMN IF NOT EXISTS company_country text DEFAULT 'Österreich';

-- Update rental_object to support multiple selections (already text, will store comma-separated or JSON)
COMMENT ON COLUMN public.contact_submissions.rental_object IS 'Can contain multiple comma-separated values';