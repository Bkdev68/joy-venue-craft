-- Create table for custom calendar events (manual entries)
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  end_time TEXT,
  event_type TEXT DEFAULT 'custom',
  color TEXT DEFAULT '#3b82f6',
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage calendar events" 
ON public.calendar_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also allow editors
CREATE POLICY "Editors can manage calendar events" 
ON public.calendar_events 
FOR ALL 
USING (has_role(auth.uid(), 'editor'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();