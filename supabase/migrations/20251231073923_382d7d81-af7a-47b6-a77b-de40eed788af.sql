-- Add billing address fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS billing_company text,
ADD COLUMN IF NOT EXISTS billing_name text,
ADD COLUMN IF NOT EXISTS billing_street text,
ADD COLUMN IF NOT EXISTS billing_zip text,
ADD COLUMN IF NOT EXISTS billing_city text,
ADD COLUMN IF NOT EXISTS billing_country text DEFAULT 'Österreich',
ADD COLUMN IF NOT EXISTS billing_vat_id text;

-- Add billing address to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS billing_company text,
ADD COLUMN IF NOT EXISTS billing_street text,
ADD COLUMN IF NOT EXISTS billing_zip text,
ADD COLUMN IF NOT EXISTS billing_city text,
ADD COLUMN IF NOT EXISTS billing_country text DEFAULT 'Österreich',
ADD COLUMN IF NOT EXISTS billing_vat_id text;