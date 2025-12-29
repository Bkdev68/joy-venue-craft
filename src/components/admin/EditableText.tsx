import { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditableTextProps {
  section: string;
  contentKey: string;
  defaultValue: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  multiline?: boolean;
}

export function EditableText({
  section,
  contentKey,
  defaultValue,
  className,
  as: Component = 'span',
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [originalValue, setOriginalValue] = useState(defaultValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('text_value')
        .eq('section', section)
        .eq('key', contentKey)
        .maybeSingle();
      
      if (data?.text_value) {
        setValue(data.text_value);
        setOriginalValue(data.text_value);
      }
    };
    fetchContent();
  }, [section, contentKey]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value === originalValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', section)
        .eq('key', contentKey)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_content')
          .update({ text_value: value })
          .eq('id', existing.id);
      } else {
        await supabase.from('site_content').insert({
          section,
          key: contentKey,
          text_value: value,
          content_type: 'text',
        });
      }

      setOriginalValue(value);
      toast({ title: 'Gespeichert' });
    } catch (error) {
      toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
      setValue(originalValue);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setValue(originalValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2 w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex-1 bg-primary/10 border border-primary rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]',
              className
            )}
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex-1 bg-primary/10 border border-primary rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary',
              className
            )}
            disabled={isSaving}
          />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 rounded bg-muted hover:bg-muted/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer relative group inline-block hover:bg-primary/5 rounded px-1 -mx-1 transition-colors',
        className
      )}
    >
      {value}
      <Pencil className="absolute -right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </Component>
  );
}
