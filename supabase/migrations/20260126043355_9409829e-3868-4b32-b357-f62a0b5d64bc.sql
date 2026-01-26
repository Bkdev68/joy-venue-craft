-- Add deleted_at column for soft delete
ALTER TABLE public.contact_submissions 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX idx_contact_submissions_deleted_at ON public.contact_submissions(deleted_at);