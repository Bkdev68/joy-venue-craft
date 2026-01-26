-- Create notes table for shared team notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all notes"
ON public.notes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Editors can view all notes
CREATE POLICY "Editors can view all notes"
ON public.notes
FOR SELECT
USING (has_role(auth.uid(), 'editor'::app_role));

-- Editors can create notes
CREATE POLICY "Editors can create notes"
ON public.notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'editor'::app_role) AND auth.uid() = user_id);

-- Editors can update their own notes
CREATE POLICY "Editors can update own notes"
ON public.notes
FOR UPDATE
USING (has_role(auth.uid(), 'editor'::app_role) AND auth.uid() = user_id);

-- Editors can delete their own notes
CREATE POLICY "Editors can delete own notes"
ON public.notes
FOR DELETE
USING (has_role(auth.uid(), 'editor'::app_role) AND auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();