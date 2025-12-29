import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Image, Package, Star, HelpCircle } from 'lucide-react';

interface Stats {
  gallery: number;
  services: number;
  testimonials: number;
  faqs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ gallery: 0, services: 0, testimonials: 0, faqs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [gallery, services, testimonials, faqs] = await Promise.all([
          supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('testimonials').select('id', { count: 'exact', head: true }),
          supabase.from('faqs').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          gallery: gallery.count || 0,
          services: services.count || 0,
          testimonials: testimonials.count || 0,
          faqs: faqs.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Galerie-Bilder', value: stats.gallery, icon: Image, color: 'text-blue-500' },
    { title: 'Services', value: stats.services, icon: Package, color: 'text-green-500' },
    { title: 'Testimonials', value: stats.testimonials, icon: Star, color: 'text-yellow-500' },
    { title: 'FAQs', value: stats.faqs, icon: HelpCircle, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Willkommen im Admin-Bereich. Hier können Sie alle Inhalte der Website verwalten.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schnellstart</CardTitle>
          <CardDescription>
            Nutzen Sie die Navigation links, um Inhalte zu bearbeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">📷 Galerie verwalten</h3>
              <p className="text-sm text-muted-foreground">
                Laden Sie neue Bilder hoch und organisieren Sie Ihre Galerie.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">📦 Services bearbeiten</h3>
              <p className="text-sm text-muted-foreground">
                Bearbeiten Sie Ihre Dienstleistungen und Preise.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">⭐ Testimonials hinzufügen</h3>
              <p className="text-sm text-muted-foreground">
                Fügen Sie Kundenbewertungen hinzu oder bearbeiten Sie bestehende.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">❓ FAQ verwalten</h3>
              <p className="text-sm text-muted-foreground">
                Erstellen und bearbeiten Sie häufig gestellte Fragen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
