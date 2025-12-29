import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

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
    fields: [
      { key: 'subtitle', label: 'Untertitel', type: 'text' },
      { key: 'title_line1', label: 'Titel Zeile 1', type: 'text' },
      { key: 'title_line2', label: 'Titel Zeile 2 (hervorgehoben)', type: 'text' },
      { key: 'description', label: 'Beschreibung', type: 'textarea' },
      { key: 'cta_primary', label: 'Primärer Button Text', type: 'text' },
      { key: 'cta_secondary', label: 'Sekundärer Button Text', type: 'text' },
    ],
  },
  {
    name: 'stats',
    label: 'Statistiken',
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
    name: 'contact',
    label: 'Kontaktdaten',
    fields: [
      { key: 'email', label: 'E-Mail', type: 'text' },
      { key: 'phone', label: 'Telefon', type: 'text' },
      { key: 'address', label: 'Adresse', type: 'text' },
      { key: 'instagram', label: 'Instagram URL', type: 'text' },
      { key: 'facebook', label: 'Facebook URL', type: 'text' },
    ],
  },
];

export default function AdminContent() {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (section: string) => {
    setSaving(true);

    try {
      const sectionData = content[section] || {};
      const sectionConfig = contentSections.find(s => s.name === section);
      
      if (!sectionConfig) return;

      for (const field of sectionConfig.fields) {
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
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inhalte</h1>
        <p className="text-muted-foreground mt-1">Bearbeiten Sie Texte und Inhalte der Website</p>
      </div>

      <Tabs defaultValue="hero">
        <TabsList>
          {contentSections.map((section) => (
            <TabsTrigger key={section.name} value={section.name}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {contentSections.map((section) => (
          <TabsContent key={section.name} value={section.name}>
            <Card>
              <CardHeader>
                <CardTitle>{section.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`${section.name}-${field.key}`}>{field.label}</Label>
                    {field.type === 'textarea' ? (
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
                <Button onClick={() => handleSave(section.name)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
