-- Add missing columns to bookings table for embed form data
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS event_time text,
ADD COLUMN IF NOT EXISTS duration_hours integer,
ADD COLUMN IF NOT EXISTS referral_sources text[],
ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'privat',
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_street text,
ADD COLUMN IF NOT EXISTS company_zip text,
ADD COLUMN IF NOT EXISTS company_city text,
ADD COLUMN IF NOT EXISTS company_country text;