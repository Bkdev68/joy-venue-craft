-- ============================================
-- PIXELPALAST - Komplettes Datenbank-Schema
-- Für Migration zu eigenem Supabase-Projekt
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- ============================================
-- 2. TABELLEN
-- ============================================

-- User Roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Services
CREATE TABLE public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    short_description text,
    image_url text,
    features jsonb DEFAULT '[]'::jsonb,
    price_from numeric,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Packages
CREATE TABLE public.packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    base_price numeric DEFAULT 0,
    hourly_rate numeric DEFAULT 0,
    duration text,
    features jsonb DEFAULT '[]'::jsonb,
    is_popular boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid,
    service_name text NOT NULL,
    package_id uuid,
    package_name text NOT NULL,
    package_price numeric NOT NULL,
    event_type text NOT NULL,
    date date NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    message text,
    billing_company text,
    billing_name text,
    billing_street text,
    billing_zip text,
    billing_city text,
    billing_country text DEFAULT 'Österreich',
    billing_vat_id text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid,
    invoice_number text NOT NULL,
    customer_number text,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    customer_address text,
    billing_company text,
    billing_street text,
    billing_zip text,
    billing_city text,
    billing_country text DEFAULT 'Österreich',
    billing_vat_id text,
    description text NOT NULL,
    service_name text,
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    net_amount numeric NOT NULL DEFAULT 0,
    vat_rate numeric DEFAULT 0,
    vat_amount numeric DEFAULT 0,
    gross_amount numeric NOT NULL DEFAULT 0,
    kilometers numeric DEFAULT 0,
    kilometer_rate numeric DEFAULT 1.00,
    kilometer_amount numeric DEFAULT 0,
    deposit_amount numeric DEFAULT 0,
    deposit_due_date date,
    deposit_paid boolean DEFAULT false,
    deposit_paid_date date,
    remaining_amount numeric DEFAULT 0,
    remaining_paid boolean DEFAULT false,
    remaining_paid_date date,
    payment_status text NOT NULL DEFAULT 'offen',
    notes text,
    pdf_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Expense Categories
CREATE TABLE public.expense_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid,
    recurring_expense_id uuid,
    vendor text NOT NULL,
    description text NOT NULL,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    net_amount numeric NOT NULL DEFAULT 0,
    vat_rate numeric DEFAULT 0,
    vat_amount numeric DEFAULT 0,
    gross_amount numeric NOT NULL DEFAULT 0,
    receipt_number text,
    receipt_file_path text,
    receipt_url text,
    is_paid boolean DEFAULT false,
    paid_date date,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recurring Expenses
CREATE TABLE public.recurring_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid,
    name text NOT NULL,
    vendor text NOT NULL,
    description text,
    amount numeric NOT NULL DEFAULT 0,
    interval text NOT NULL DEFAULT 'monatlich',
    next_due_date date NOT NULL,
    auto_create boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE public.testimonials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text,
    company text,
    content text NOT NULL,
    rating integer DEFAULT 5,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- FAQs
CREATE TABLE public.faqs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery Images
CREATE TABLE public.gallery_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    src text NOT NULL,
    alt text NOT NULL,
    category text DEFAULT 'Alle',
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Site Content
CREATE TABLE public.site_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section text NOT NULL,
    key text NOT NULL,
    content_type text NOT NULL DEFAULT 'text',
    text_value text,
    image_url text,
    json_value jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 3. DATABASE FUNCTIONS
-- ============================================

-- Has Role Function (für RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Generate Invoice Number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    current_year text;
    next_number integer;
    new_invoice_number text;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number LIKE current_year || '-%' 
            THEN CAST(SUBSTRING(invoice_number FROM LENGTH(current_year) + 2) AS integer)
            ELSE 0 
        END
    ), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number LIKE current_year || '-%';
    
    new_invoice_number := current_year || '-' || LPAD(next_number::text, 3, '0');
    
    RETURN new_invoice_number;
END;
$$;

-- Update Updated At Column Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON public.recurring_expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON public.expense_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON public.gallery_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- User Roles Policies
CREATE POLICY "Admins can view user roles" ON public.user_roles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Services Policies
CREATE POLICY "Admins can manage services" ON public.services
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active services" ON public.services
FOR SELECT USING (is_active = true);

-- Packages Policies
CREATE POLICY "Admins can manage packages" ON public.packages
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active packages" ON public.packages
FOR SELECT USING (is_active = true);

-- Bookings Policies
CREATE POLICY "Admins can manage bookings" ON public.bookings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Invoices Policies
CREATE POLICY "Admins can manage invoices" ON public.invoices
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Expenses Policies
CREATE POLICY "Admins can manage expenses" ON public.expenses
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Recurring Expenses Policies
CREATE POLICY "Admins can manage recurring expenses" ON public.recurring_expenses
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Expense Categories Policies
CREATE POLICY "Admins can manage expense categories" ON public.expense_categories
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active expense categories" ON public.expense_categories
FOR SELECT USING (is_active = true);

-- Testimonials Policies
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
FOR SELECT USING (is_active = true);

-- FAQs Policies
CREATE POLICY "Admins can manage FAQs" ON public.faqs
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active FAQs" ON public.faqs
FOR SELECT USING (is_active = true);

-- Gallery Images Policies
CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active gallery images" ON public.gallery_images
FOR SELECT USING (is_active = true);

-- Site Content Policies
CREATE POLICY "Admins can manage site content" ON public.site_content
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view site content" ON public.site_content
FOR SELECT USING (true);

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('expense-receipts', 'expense-receipts', false);

-- Storage Policies für uploads (public)
CREATE POLICY "Anyone can view uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Admins can upload to uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update uploads" ON storage.objects
FOR UPDATE USING (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'));

-- Storage Policies für expense-receipts (private)
CREATE POLICY "Admins can view expense receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'expense-receipts' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload expense receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'expense-receipts' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expense receipts" ON storage.objects
FOR UPDATE USING (bucket_id = 'expense-receipts' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expense receipts" ON storage.objects
FOR DELETE USING (bucket_id = 'expense-receipts' AND has_role(auth.uid(), 'admin'));
