-- Add new fields to contact_submissions table for extended form
ALTER TABLE public.contact_submissions
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS rental_object text,
ADD COLUMN IF NOT EXISTS event_type text,
ADD COLUMN IF NOT EXISTS event_time text,
ADD COLUMN IF NOT EXISTS duration_hours integer,
ADD COLUMN IF NOT EXISTS referral_sources text[];