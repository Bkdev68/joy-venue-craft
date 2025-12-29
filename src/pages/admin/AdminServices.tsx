import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Package } from 'lucide-react';

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  price_from: number | null;
  features: unknown[];
  is_active: boolean;
  sort_order: number;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    short_description: '',
    price_from: '',
    features: '',
  });

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setServices((data || []).map(s => ({
        ...s,
        features: Array.isArray(s.features) ? s.features : []
      })));
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Fehler beim Laden der Services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `services/${fileName}`;

    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = editingService?.image_url || null;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const serviceData = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        short_description: formData.short_description || null,
        image_url: imageUrl,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        features: formData.features.split('\n').filter(f => f.trim()),
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Service aktualisiert');
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            ...serviceData,
            sort_order: services.length,
          });

        if (error) throw error;
        toast.success('Service hinzugefügt');
      }

      setDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      slug: '',
      title: '',
      description: '',
      short_description: '',
      price_from: '',
      features: '',
    });
    setSelectedFile(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      slug: service.slug,
      title: service.title,
      description: service.description || '',
      short_description: service.short_description || '',
      price_from: service.price_from?.toString() || '',
      features: service.features.join('\n'),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Service wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Service gelöscht');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie Ihre Dienstleistungen</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Service hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Service bearbeiten' : 'Neuer Service'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="z.B. Photobooth"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="z.B. photobooth"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Kurzbeschreibung</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Kurze Beschreibung für Übersichten"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ausführliche Beschreibung"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_from">Preis ab (€)</Label>
                <Input
                  id="price_from"
                  type="number"
                  value={formData.price_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_from: e.target.value }))}
                  placeholder="z.B. 299"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Bild</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {editingService?.image_url && !selectedFile && (
                  <img src={editingService.image_url} alt="" className="h-20 w-20 object-cover rounded" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (eine pro Zeile)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Laden...</div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Services vorhanden. Fügen Sie Ihren ersten Service hinzu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className={!service.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {service.short_description || service.description || 'Keine Beschreibung'}
                    </p>
                    {service.price_from && (
                      <p className="text-sm font-medium text-primary">ab €{service.price_from}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(service)}
                      className={`text-xs px-2 py-1 rounded ${
                        service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {service.is_active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
