-- Add assigned_staff column to bookings table (array of text for staff names)
ALTER TABLE public.bookings 
ADD COLUMN assigned_staff text[] DEFAULT '{}';

-- Add custom_staff column for additional custom staff names
ALTER TABLE public.bookings 
ADD COLUMN custom_staff text DEFAULT NULL;