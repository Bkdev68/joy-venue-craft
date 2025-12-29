-- Add base_price and hourly_rate to packages table for dynamic pricing
ALTER TABLE public.packages 
ADD COLUMN base_price numeric DEFAULT 0,
ADD COLUMN hourly_rate numeric DEFAULT 0;

-- Migrate existing price to base_price (assuming current price is for a base package)
UPDATE public.packages SET base_price = price WHERE base_price = 0;