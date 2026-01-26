-- Add google_calendar_event_id to calendar_events table
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS google_calendar_event_id text;