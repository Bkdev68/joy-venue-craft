-- Allow public to insert bookings (for embed contact form)
CREATE POLICY "Anyone can create a booking inquiry"
ON public.bookings
FOR INSERT
WITH CHECK (true);