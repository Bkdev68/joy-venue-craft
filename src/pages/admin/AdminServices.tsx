import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Package, Clock, Euro } from 'lucide-react';

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

interface ServicePackage {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  base_price: number | null;
  hourly_rate: number | null;
  duration: string | null;
  features: unknown[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [serviceForm, setServiceForm] = useState({
    slug: '',
    title: '',
    description: '',
    short_description: '',
    price_from: '',
    features: '',
  });

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    base_price: '',
    hourly_rate: '',
    duration: '',
    features: '',
    is_popular: false,
  });

  const fetchData = async () => {
    try {
      const [servicesRes, packagesRes] = await Promise.all([
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('packages').select('*').order('sort_order'),
      ]);

      if (servicesRes.error) throw servicesRes.error;
      if (packagesRes.error) throw packagesRes.error;

      setServices((servicesRes.data || []).map(s => ({
        ...s,
        features: Array.isArray(s.features) ? s.features : []
      })));
      setPackages((packagesRes.data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : []
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Service handlers
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = editingService?.image_url || null;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const serviceData = {
        slug: serviceForm.slug,
        title: serviceForm.title,
        description: serviceForm.description || null,
        short_description: serviceForm.short_description || null,
        image_url: imageUrl,
        price_from: serviceForm.price_from ? parseFloat(serviceForm.price_from) : null,
        features: serviceForm.features.split('\n').filter(f => f.trim()),
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

      setServiceDialogOpen(false);
      resetServiceForm();
      fetchData();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setServiceForm({
      slug: '',
      title: '',
      description: '',
      short_description: '',
      price_from: '',
      features: '',
    });
    setSelectedFile(null);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      slug: service.slug,
      title: service.title,
      description: service.description || '',
      short_description: service.short_description || '',
      price_from: service.price_from?.toString() || '',
      features: (service.features as string[]).join('\n'),
    });
    setServiceDialogOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Service und alle zugehörigen Pakete wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Service gelöscht');
      fetchData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const toggleServiceActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  // Package handlers
  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;
    setSaving(true);

    try {
      const packageData = {
        service_id: selectedServiceId,
        name: packageForm.name,
        description: packageForm.description || null,
        price: parseFloat(packageForm.price) || 0,
        base_price: parseFloat(packageForm.base_price) || 0,
        hourly_rate: parseFloat(packageForm.hourly_rate) || 0,
        duration: packageForm.duration || null,
        features: packageForm.features.split('\n').filter(f => f.trim()),
        is_popular: packageForm.is_popular,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        toast.success('Paket aktualisiert');
      } else {
        const servicePackages = packages.filter(p => p.service_id === selectedServiceId);
        const { error } = await supabase
          .from('packages')
          .insert({
            ...packageData,
            sort_order: servicePackages.length,
          });

        if (error) throw error;
        toast.success('Paket hinzugefügt');
      }

      setPackageDialogOpen(false);
      resetPackageForm();
      fetchData();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const resetPackageForm = () => {
    setEditingPackage(null);
    setPackageForm({
      name: '',
      description: '',
      price: '',
      base_price: '',
      hourly_rate: '',
      duration: '',
      features: '',
      is_popular: false,
    });
  };

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setSelectedServiceId(pkg.service_id);
    setPackageForm({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      base_price: pkg.base_price?.toString() || '',
      hourly_rate: pkg.hourly_rate?.toString() || '',
      duration: pkg.duration || '',
      features: (pkg.features as string[]).join('\n'),
      is_popular: pkg.is_popular,
    });
    setPackageDialogOpen(true);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Paket wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Paket gelöscht');
      fetchData();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const togglePackageActive = async (pkg: ServicePackage) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_active: !pkg.is_active })
        .eq('id', pkg.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const openAddPackageDialog = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    resetPackageForm();
    setPackageDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services & Pakete</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie Dienstleistungen, Preise und Pakete</p>
        </div>
        <Dialog open={serviceDialogOpen} onOpenChange={(open) => {
          setServiceDialogOpen(open);
          if (!open) resetServiceForm();
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
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="z.B. Photobooth"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="z.B. photobooth"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Kurzbeschreibung</Label>
                <Input
                  id="short_description"
                  value={serviceForm.short_description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Kurze Beschreibung für Übersichten"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ausführliche Beschreibung"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_from">Preis ab (€)</Label>
                <Input
                  id="price_from"
                  type="number"
                  value={serviceForm.price_from}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price_from: e.target.value }))}
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
                  value={serviceForm.features}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setServiceDialogOpen(false)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Package Dialog */}
      <Dialog open={packageDialogOpen} onOpenChange={(open) => {
        setPackageDialogOpen(open);
        if (!open) resetPackageForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Paket bearbeiten' : 'Neues Paket'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePackageSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pkg_name">Paketname</Label>
              <Input
                id="pkg_name"
                value={packageForm.name}
                onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Starter, Classic, Premium"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pkg_base_price">Grundpreis (€)</Label>
                <Input
                  id="pkg_base_price"
                  type="number"
                  value={packageForm.base_price}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, base_price: e.target.value }))}
                  placeholder="z.B. 200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg_hourly_rate">Stundenpreis (€)</Label>
                <Input
                  id="pkg_hourly_rate"
                  type="number"
                  value={packageForm.hourly_rate}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="z.B. 50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pkg_duration">Dauer (Anzeige)</Label>
                <Input
                  id="pkg_duration"
                  value={packageForm.duration}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="z.B. ab 2 Stunden"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg_price" className="text-muted-foreground">Legacy-Preis (€)</Label>
                <Input
                  id="pkg_price"
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Alter Preis (optional)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg_description">Beschreibung</Label>
              <Input
                id="pkg_description"
                value={packageForm.description}
                onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung des Pakets"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg_features">Inkludierte Leistungen (eine pro Zeile)</Label>
              <Textarea
                id="pkg_features"
                value={packageForm.features}
                onChange={(e) => setPackageForm(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Unbegrenzte Fotos&#10;Sofortdruck&#10;Digitale Galerie"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="pkg_popular"
                checked={packageForm.is_popular}
                onCheckedChange={(checked) => setPackageForm(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label htmlFor="pkg_popular">Als "Beliebt" markieren</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Speichern...' : 'Speichern'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setPackageDialogOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Services vorhanden. Fügen Sie Ihren ersten Service hinzu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {services.map((service) => {
            const servicePackages = packages.filter(p => p.service_id === service.id);
            
            return (
              <Card key={service.id} className={!service.is_active ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
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
                      <div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {service.short_description || 'Keine Beschreibung'}
                        </p>
                        {service.price_from && (
                          <p className="text-sm font-medium text-primary mt-1">ab €{service.price_from}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleServiceActive(service)}
                        className={`text-xs px-2 py-1 rounded ${
                          service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {service.is_active ? 'Aktiv' : 'Inaktiv'}
                      </button>
                      <Button size="icon" variant="ghost" onClick={() => handleEditService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Pakete & Preise</h4>
                      <Button size="sm" variant="outline" onClick={() => openAddPackageDialog(service.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Paket hinzufügen
                      </Button>
                    </div>
                    
                    {servicePackages.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Noch keine Pakete. Klicken Sie auf "Paket hinzufügen".
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {servicePackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              !pkg.is_active ? 'opacity-50' : ''
                            } ${pkg.is_popular ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{pkg.name}</span>
                                {pkg.is_popular && (
                                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                    Beliebt
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                {pkg.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {pkg.duration}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Euro className="h-3 w-3" />
                                  €{pkg.base_price || pkg.price}
                                  {(pkg.hourly_rate ?? 0) > 0 && (
                                    <span className="text-xs">+€{pkg.hourly_rate}/Std</span>
                                  )}
                                </span>
                              </div>
                              {(pkg.features as string[]).length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {(pkg.features as string[]).slice(0, 3).join(' • ')}
                                  {(pkg.features as string[]).length > 3 && ` +${(pkg.features as string[]).length - 3} mehr`}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePackageActive(pkg)}
                                className={`text-xs px-2 py-1 rounded ${
                                  pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                              </button>
                              <Button size="icon" variant="ghost" onClick={() => handleEditPackage(pkg)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeletePackage(pkg.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
