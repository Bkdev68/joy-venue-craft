import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

const categories = ['Alle', 'Photobooth', '360° Video', 'Hochzeit', 'Firmenevents'];

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({ alt: '', category: 'Alle' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Fehler beim Laden der Bilder');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

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
    setUploading(true);

    try {
      let imageUrl = editingImage?.src || '';

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      if (!imageUrl && !editingImage) {
        toast.error('Bitte wählen Sie ein Bild aus');
        return;
      }

      if (editingImage) {
        const { error } = await supabase
          .from('gallery_images')
          .update({
            src: imageUrl || editingImage.src,
            alt: formData.alt,
            category: formData.category,
          })
          .eq('id', editingImage.id);

        if (error) throw error;
        toast.success('Bild aktualisiert');
      } else {
        const { error } = await supabase
          .from('gallery_images')
          .insert({
            src: imageUrl,
            alt: formData.alt,
            category: formData.category,
            sort_order: images.length,
          });

        if (error) throw error;
        toast.success('Bild hinzugefügt');
      }

      setDialogOpen(false);
      setEditingImage(null);
      setFormData({ alt: '', category: 'Alle' });
      setSelectedFile(null);
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bild wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Bild gelöscht');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({ alt: image.alt, category: image.category });
    setDialogOpen(true);
  };

  const toggleActive = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_active: !image.is_active })
        .eq('id', image.id);

      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Galerie</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie Ihre Galerie-Bilder</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingImage(null);
            setFormData({ alt: '', category: 'Alle' });
            setSelectedFile(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Bild hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingImage ? 'Bild bearbeiten' : 'Neues Bild'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Bild</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {editingImage && !selectedFile && (
                  <img src={editingImage.src} alt="" className="h-20 w-20 object-cover rounded" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt">Beschreibung (Alt-Text)</Label>
                <Input
                  id="alt"
                  value={formData.alt}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="z.B. Gäste beim Photobooth Event"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? 'Speichern...' : 'Speichern'}
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
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Bilder vorhanden. Fügen Sie Ihr erstes Bild hinzu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className={!image.is_active ? 'opacity-50' : ''}>
              <div className="relative aspect-square">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => handleEdit(image)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{image.alt}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{image.category}</span>
                  <button
                    onClick={() => toggleActive(image)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {image.is_active ? 'Aktiv' : 'Inaktiv'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
