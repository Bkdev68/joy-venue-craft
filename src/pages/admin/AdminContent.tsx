import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Upload, Image } from 'lucide-react';

interface ContentItem {
  id: string;
  section: string;
  key: string;
  content_type: string;
  text_value: string | null;
  image_url: string | null;
}

const contentSections = [
  {
    name: 'hero',
    label: 'Hero-Bereich',
    description: 'Hauptbereich ganz oben auf der Startseite',
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title_line1', label: 'Titel Zeile 1', type: 'text' },
      { key: 'title_line2', label: 'Titel Zeile 2 (hervorgehoben)', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
      { key: 'cta_primary', label: 'Button Text (Primär)', type: 'text' },
      { key: 'cta_secondary', label: 'Button Text (Sekundär)', type: 'text' },
      { key: 'image', label: 'Hero-Bild', type: 'image' },
    ],
  },
  {
    name: 'stats',
    label: 'Statistiken',
    description: 'Die drei Zahlen unter dem Hero-Bild',
    fields: [
      { key: 'stat1_value', label: 'Statistik 1 Wert', type: 'text' },
      { key: 'stat1_label', label: 'Statistik 1 Label', type: 'text' },
      { key: 'stat2_value', label: 'Statistik 2 Wert', type: 'text' },
      { key: 'stat2_label', label: 'Statistik 2 Label', type: 'text' },
      { key: 'stat3_value', label: 'Statistik 3 Wert', type: 'text' },
      { key: 'stat3_label', label: 'Statistik 3 Label', type: 'text' },
    ],
  },
  {
    name: 'services_section',
    label: 'Services-Bereich',
    description: 'Überschriften des Services-Bereichs',
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
      { key: 'button_text', label: 'Button Text', type: 'text' },
    ],
  },
  {
    name: 'benefits_section',
    label: 'Vorteile-Bereich',
    description: 'Die 4 Vorteile-Karten',
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
      { key: 'benefit_1_title', label: 'Vorteil 1 Titel', type: 'text' },
      { key: 'benefit_1_description', label: 'Vorteil 1 Text', type: 'textarea' },
      { key: 'benefit_2_title', label: 'Vorteil 2 Titel', type: 'text' },
      { key: 'benefit_2_description', label: 'Vorteil 2 Text', type: 'textarea' },
      { key: 'benefit_3_title', label: 'Vorteil 3 Titel', type: 'text' },
      { key: 'benefit_3_description', label: 'Vorteil 3 Text', type: 'textarea' },
      { key: 'benefit_4_title', label: 'Vorteil 4 Titel', type: 'text' },
      { key: 'benefit_4_description', label: 'Vorteil 4 Text', type: 'textarea' },
    ],
  },
  {
    name: 'process_section',
    label: 'Ablauf-Bereich',
    description: 'Die 4 Schritte des Buchungsprozesses',
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
      { key: 'step_1_title', label: 'Schritt 1 Titel', type: 'text' },
      { key: 'step_1_description', label: 'Schritt 1 Text', type: 'textarea' },
      { key: 'step_2_title', label: 'Schritt 2 Titel', type: 'text' },
      { key: 'step_2_description', label: 'Schritt 2 Text', type: 'textarea' },
      { key: 'step_3_title', label: 'Schritt 3 Titel', type: 'text' },
      { key: 'step_3_description', label: 'Schritt 3 Text', type: 'textarea' },
      { key: 'step_4_title', label: 'Schritt 4 Titel', type: 'text' },
      { key: 'step_4_description', label: 'Schritt 4 Text', type: 'textarea' },
    ],
  },
  {
    name: 'cta_section',
    label: 'CTA-Bereich',
    description: 'Call-to-Action am Ende der Startseite',
    fields: [
      { key: 'title_line1', label: 'Titel Zeile 1', type: 'text' },
      { key: 'title_line2', label: 'Titel Zeile 2 (hervorgehoben)', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
      { key: 'button_primary', label: 'Button Text', type: 'text' },
      { key: 'phone', label: 'Telefonnummer', type: 'text' },
    ],
  },
  {
    name: 'gallery_section',
    label: 'Galerie-Bereich',
    description: 'Überschriften des Galerie-Vorschau-Bereichs',
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
    ],
  },
  {
    name: 'testimonials_section',
    label: 'Bewertungen-Bereich',
    description: 'Überschriften des Testimonials-Bereichs',
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
    ],
  },
];

export default function AdminContent() {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*');

        if (error) throw error;

        const contentMap: Record<string, Record<string, string>> = {};
        (data || []).forEach((item: ContentItem) => {
          if (!contentMap[item.section]) {
            contentMap[item.section] = {};
          }
          contentMap[item.section][item.key] = item.text_value || item.image_url || '';
        });

        setContent(contentMap);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleChange = (section: string, key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleImageUpload = async (section: string, key: string, file: File) => {
    setUploadingImage(`${section}-${key}`);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${section}-${key}-${Date.now()}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      // Save to database
      const { error: dbError } = await supabase
        .from('site_content')
        .upsert({
          section,
          key,
          content_type: 'image',
          image_url: imageUrl,
        }, {
          onConflict: 'section,key',
        });

      if (dbError) throw dbError;

      handleChange(section, key, imageUrl);
      toast.success('Bild hochgeladen');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Fehler beim Hochladen');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSave = async (section: string) => {
    setSaving(section);

    try {
      const sectionData = content[section] || {};
      const sectionConfig = contentSections.find(s => s.name === section);
      
      if (!sectionConfig) return;

      for (const field of sectionConfig.fields) {
        if (field.type === 'image') continue; // Images are saved immediately on upload
        
        const value = sectionData[field.key] || '';
        
        const { error } = await supabase
          .from('site_content')
          .upsert({
            section,
            key: field.key,
            content_type: field.type === 'textarea' ? 'text' : field.type,
            text_value: value,
          }, {
            onConflict: 'section,key',
          });

        if (error) throw error;
      }

      toast.success('Änderungen gespeichert');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Website-Inhalte</h1>
        <p className="text-muted-foreground mt-1">Bearbeiten Sie alle Texte und Bilder der Website</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          {contentSections.map((section) => (
            <TabsTrigger key={section.name} value={section.name} className="text-sm">
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {contentSections.map((section) => (
          <TabsContent key={section.name} value={section.name}>
            <Card>
              <CardHeader>
                <CardTitle>{section.label}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`${section.name}-${field.key}`}>{field.label}</Label>
                    
                    {field.type === 'image' ? (
                      <div className="space-y-3">
                        {content[section.name]?.[field.key] && (
                          <div className="relative w-full max-w-md">
                            <img
                              src={content[section.name][field.key]}
                              alt={field.label}
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <Input
                            id={`${section.name}-${field.key}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(section.name, field.key, file);
                            }}
                            disabled={uploadingImage === `${section.name}-${field.key}`}
                            className="max-w-xs"
                          />
                          {uploadingImage === `${section.name}-${field.key}` && (
                            <span className="text-sm text-muted-foreground">Hochladen...</span>
                          )}
                        </div>
                      </div>
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        id={`${section.name}-${field.key}`}
                        value={content[section.name]?.[field.key] || ''}
                        onChange={(e) => handleChange(section.name, field.key, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`${section.name}-${field.key}`}
                        value={content[section.name]?.[field.key] || ''}
                        onChange={(e) => handleChange(section.name, field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                
                <Button 
                  onClick={() => handleSave(section.name)} 
                  disabled={saving === section.name}
                  className="mt-4"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === section.name ? 'Speichern...' : 'Speichern'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
