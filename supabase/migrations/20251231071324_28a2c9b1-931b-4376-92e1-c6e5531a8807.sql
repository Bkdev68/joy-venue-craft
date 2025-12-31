-- Expense categories table
CREATE TABLE public.expense_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.expense_categories (name, description, sort_order) VALUES
    ('Equipment & Technik', 'Kameras, Beleuchtung, Booth-Zubehör', 1),
    ('Fahrtkosten & Reisen', 'Benzin, Kilometergeld, Parken', 2),
    ('Software & Abos', 'Adobe, Hosting, Tools', 3),
    ('Marketing & Werbung', 'Flyer, Online-Werbung, Social Media', 4),
    ('Büro & Verwaltung', 'Büromaterial, Porto, Telefon', 5),
    ('Sonstiges', 'Andere Ausgaben', 6);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for expense_categories
CREATE POLICY "Anyone can view active expense categories" 
ON public.expense_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage expense categories" 
ON public.expense_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Invoices table (linked to bookings)
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    invoice_number text NOT NULL UNIQUE,
    customer_number text,
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    customer_address text,
    description text NOT NULL,
    service_name text,
    net_amount numeric(10,2) NOT NULL DEFAULT 0,
    vat_rate numeric(5,2) DEFAULT 0,
    vat_amount numeric(10,2) DEFAULT 0,
    gross_amount numeric(10,2) NOT NULL DEFAULT 0,
    kilometers numeric(10,2) DEFAULT 0,
    kilometer_rate numeric(5,2) DEFAULT 1.00,
    kilometer_amount numeric(10,2) DEFAULT 0,
    payment_status text NOT NULL DEFAULT 'offen' CHECK (payment_status IN ('offen', 'teilzahlung', 'bezahlt', 'storniert')),
    deposit_amount numeric(10,2) DEFAULT 0,
    deposit_due_date date,
    deposit_paid boolean DEFAULT false,
    deposit_paid_date date,
    remaining_amount numeric(10,2) DEFAULT 0,
    remaining_paid boolean DEFAULT false,
    remaining_paid_date date,
    notes text,
    pdf_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Admins can manage invoices" 
ON public.invoices 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Expenses table
CREATE TABLE public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number text,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    vendor text NOT NULL,
    category_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    description text NOT NULL,
    net_amount numeric(10,2) NOT NULL DEFAULT 0,
    vat_rate numeric(5,2) DEFAULT 0,
    vat_amount numeric(10,2) DEFAULT 0,
    gross_amount numeric(10,2) NOT NULL DEFAULT 0,
    is_paid boolean DEFAULT false,
    paid_date date,
    receipt_url text,
    notes text,
    recurring_expense_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for expenses
CREATE POLICY "Admins can manage expenses" 
ON public.expenses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Recurring expenses table
CREATE TABLE public.recurring_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    vendor text NOT NULL,
    category_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    description text,
    amount numeric(10,2) NOT NULL DEFAULT 0,
    interval text NOT NULL DEFAULT 'monatlich' CHECK (interval IN ('monatlich', 'vierteljährlich', 'jährlich')),
    next_due_date date NOT NULL,
    is_active boolean DEFAULT true,
    auto_create boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_expenses
CREATE POLICY "Admins can manage recurring expenses" 
ON public.recurring_expenses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_recurring_expenses_updated_at
BEFORE UPDATE ON public.recurring_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint for recurring_expense_id
ALTER TABLE public.expenses 
ADD CONSTRAINT fk_recurring_expense 
FOREIGN KEY (recurring_expense_id) 
REFERENCES public.recurring_expenses(id) 
ON DELETE SET NULL;

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
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