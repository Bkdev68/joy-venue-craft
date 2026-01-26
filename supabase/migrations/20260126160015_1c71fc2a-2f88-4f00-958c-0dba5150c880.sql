-- Add google_calendar_event_id column to bookings table for Google Calendar sync
ALTER TABLE public.bookings 
ADD COLUMN google_calendar_event_id text;