-- Add receipt file column to expenses table
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_file_path TEXT;

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for expense receipts (admin only)
CREATE POLICY "Admins can upload expense receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expense-receipts' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view expense receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expense-receipts' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete expense receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expense-receipts' 
  AND public.has_role(auth.uid(), 'admin')
);