import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Image, 
  MessageSquare, 
  Star, 
  HelpCircle,
  TrendingUp,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

interface Booking {
  id: string;
  date: string;
  event_type: string;
  service_name: string;
  package_name: string;
  package_price: number;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  topService: string;
  topEventType: string;
  galleryImages: number;
  testimonials: number;
  faqs: number;
}

export default function AdminInsights() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = subDays(new Date(), parseInt(timeRange));
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch content counts
      const [galleryRes, testimonialsRes, faqsRes] = await Promise.all([
        supabase.from('gallery_images').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('testimonials').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('faqs').select('id', { count: 'exact' }).eq('is_active', true),
      ]);

      const bookingsList = bookingsData || [];
      
      // Calculate stats
      const pendingBookings = bookingsList.filter(b => b.status === 'pending').length;
      const confirmedBookings = bookingsList.filter(b => b.status === 'confirmed').length;
      const totalRevenue = bookingsList
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.package_price || 0), 0);
      
      // Find top service and event type
      const serviceCount: Record<string, number> = {};
      const eventTypeCount: Record<string, number> = {};
      bookingsList.forEach(b => {
        serviceCount[b.service_name] = (serviceCount[b.service_name] || 0) + 1;
        eventTypeCount[b.event_type] = (eventTypeCount[b.event_type] || 0) + 1;
      });
      
      const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
      const topEventType = Object.entries(eventTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      setBookings(bookingsList);
      setStats({
        totalBookings: bookingsList.length,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
        avgBookingValue: bookingsList.length > 0 ? totalRevenue / confirmedBookings || 0 : 0,
        topService,
        topEventType,
        galleryImages: galleryRes.count || 0,
        testimonials: testimonialsRes.count || 0,
        faqs: faqsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Insights & Statistiken</h1>
          <p className="text-muted-foreground mt-1">Übersicht über Buchungen und Website-Inhalte</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buchungsanfragen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingBookings || 0} ausstehend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bestätigte Buchungen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.confirmedBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalBookings ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) : 0}% Konversionsrate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz (bestätigt)</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ø €{Math.round(stats?.avgBookingValue || 0)} pro Buchung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Service</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats?.topService || '-'}</div>
            <p className="text-xs text-muted-foreground">
              Beliebtester Event-Typ: {stats?.topEventType || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galerie-Bilder</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.galleryImages || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.testimonials || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.faqs || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Buchungsanfragen</CardTitle>
          <CardDescription>Verwalten Sie eingehende Buchungen</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine Buchungen im ausgewählten Zeitraum
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{booking.customer_name}</span>
                      <Badge 
                        variant={
                          booking.status === 'confirmed' ? 'default' : 
                          booking.status === 'cancelled' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {booking.status === 'pending' ? 'Ausstehend' :
                         booking.status === 'confirmed' ? 'Bestätigt' :
                         booking.status === 'cancelled' ? 'Storniert' : booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.service_name} • {booking.package_name} • {booking.event_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.date), 'PPP', { locale: de })} • {booking.customer_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">€{booking.package_price}</span>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Bestätigen
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Analytics Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics
          </CardTitle>
          <CardDescription>
            Für detaillierte Website-Analysen (Besucher, Traffic-Quellen, Verhalten)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Um Google Analytics zu aktivieren, fügen Sie Ihre Measurement ID in den Einstellungen hinzu.
          </p>
          <Button variant="outline" asChild>
            <a href="/admin/einstellungen">Zu den Einstellungen</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
