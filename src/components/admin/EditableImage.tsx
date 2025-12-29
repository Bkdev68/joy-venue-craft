import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditableImageProps {
  section: string;
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export function EditableImage({
  section,
  contentKey,
  defaultSrc,
  alt,
  className,
}: EditableImageProps) {
  const [src, setSrc] = useState(defaultSrc);
  const [isUploading, setIsUploading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${section}-${contentKey}-${Date.now()}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      // Save to site_content
      const { data: existing } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', section)
        .eq('key', contentKey)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('site_content')
          .update({ image_url: publicUrl, text_value: publicUrl })
          .eq('id', existing.id);
      } else {
        await supabase.from('site_content').insert({
          section,
          key: contentKey,
          image_url: publicUrl,
          text_value: publicUrl,
          content_type: 'image',
        });
      }

      setSrc(publicUrl);
      toast({ title: 'Bild hochgeladen' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Fehler beim Hochladen', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setShowOverlay(false);
    }
  };

  return (
    <div
      className={cn('relative group cursor-pointer', className)}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => !isUploading && setShowOverlay(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      
      {(showOverlay || isUploading) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          ) : (
            <div className="text-white text-center">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <span className="text-sm">Bild ändern</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
