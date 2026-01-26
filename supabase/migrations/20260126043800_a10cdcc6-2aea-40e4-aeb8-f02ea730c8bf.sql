-- Add deleted_at column for soft delete on bookings
ALTER TABLE public.bookings 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX idx_bookings_deleted_at ON public.bookings(deleted_at);