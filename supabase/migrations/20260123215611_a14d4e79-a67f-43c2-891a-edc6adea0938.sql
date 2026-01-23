-- =====================================================
-- PRICING CONFIGURATION TABLES
-- =====================================================

-- Table for base prices per rental object (Mietobjekt)
CREATE TABLE public.pricing_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_object TEXT NOT NULL UNIQUE, -- e.g., 'photobooth', 'videobooth360', 'audioguestbook'
  display_name TEXT NOT NULL,
  base_price NUMERIC NOT NULL DEFAULT 0, -- Fixed setup/base price
  hourly_rate NUMERIC NOT NULL DEFAULT 0, -- Default hourly rate
  min_hours INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for tiered hourly pricing (Staffelpreise nach Stunden)
CREATE TABLE public.pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_object TEXT NOT NULL REFERENCES public.pricing_base(rental_object) ON DELETE CASCADE,
  min_hours INTEGER NOT NULL, -- e.g., 1
  max_hours INTEGER, -- NULL = unlimited (e.g., 7+)
  hourly_rate NUMERIC NOT NULL, -- Rate for this tier
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rental_object, min_hours)
);

-- Table for combo discounts (Rabatt bei Kombination)
CREATE TABLE public.pricing_combos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Photo + Video Combo"
  description TEXT,
  rental_objects TEXT[] NOT NULL, -- e.g., ['photobooth', 'videobooth360']
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL DEFAULT 0, -- e.g., 10 for 10% or 50 for €50
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for travel/distance pricing (Anfahrt)
CREATE TABLE public.pricing_travel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Standard',
  free_kilometers INTEGER NOT NULL DEFAULT 0, -- Free km included
  rate_per_km NUMERIC NOT NULL DEFAULT 0.50, -- € per km after free km
  min_charge NUMERIC NOT NULL DEFAULT 0, -- Minimum travel fee
  max_charge NUMERIC, -- Maximum travel fee (cap)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_travel ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage pricing_base"
  ON public.pricing_base FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage pricing_tiers"
  ON public.pricing_tiers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage pricing_combos"
  ON public.pricing_combos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage pricing_travel"
  ON public.pricing_travel FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public read for active pricing (for calculations)
CREATE POLICY "Anyone can view active pricing_base"
  ON public.pricing_base FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view pricing_tiers"
  ON public.pricing_tiers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view active pricing_combos"
  ON public.pricing_combos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active pricing_travel"
  ON public.pricing_travel FOR SELECT
  USING (is_active = true);

-- Updated_at triggers
CREATE TRIGGER update_pricing_base_updated_at
  BEFORE UPDATE ON public.pricing_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_combos_updated_at
  BEFORE UPDATE ON public.pricing_combos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_travel_updated_at
  BEFORE UPDATE ON public.pricing_travel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();