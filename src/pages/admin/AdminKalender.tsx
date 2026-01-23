import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Euro,
  Mail,
  Phone,
  User,
  MapPin,
  Clock,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  date: string;
  event_type: string;
  service_name: string;
  package_name: string;
  package_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  status: string;
  billing_company: string | null;
  billing_name: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_vat_id: string | null;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Bestätigt',
  completed: 'Abgeschlossen',
  pending: 'Ausstehend',
  cancelled: 'Storniert',
};

export default function AdminKalender() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch confirmed and completed bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['confirmed', 'completed'])
        .order('date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Fehler beim Laden der Buchungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return bookings.filter(b => b.date === dateStr);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kalender</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Übersicht aller bestätigten Aufträge
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Bestätigt
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Abgeschlossen
          </Badge>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg md:text-xl">
              {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </CardTitle>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div 
                key={day} 
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[80px] md:min-h-[100px] p-1 border rounded-md transition-colors",
                    !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                    isToday && "border-primary border-2",
                    dayBookings.length > 0 && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "text-xs md:text-sm font-medium mb-1 text-right pr-1",
                    isToday && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map(booking => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className={cn(
                          "w-full text-left text-[10px] md:text-xs px-1 py-0.5 rounded truncate text-white transition-opacity hover:opacity-80",
                          statusColors[booking.status] || 'bg-gray-500'
                        )}
                        title={`${booking.customer_name} - ${booking.service_name}`}
                      >
                        <span className="hidden md:inline">{booking.customer_name}</span>
                        <span className="md:hidden">{booking.customer_name.split(' ')[0]}</span>
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{dayBookings.length - 3} mehr
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Kommende Aufträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings
              .filter(b => new Date(b.date) >= new Date())
              .slice(0, 5)
              .map(booking => (
                <button
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    statusColors[booking.status]
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{booking.customer_name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {booking.service_name} • {booking.package_name}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium">
                      {format(new Date(booking.date), 'dd. MMM', { locale: de })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.package_price.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </div>
                </button>
              ))}
            {bookings.filter(b => new Date(b.date) >= new Date()).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Keine kommenden Aufträge
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Auftragsdetails
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <Badge className={cn("text-white", statusColors[selectedBooking.status])}>
                  {statusLabels[selectedBooking.status]}
                </Badge>
                <span className="text-sm font-medium">
                  {format(new Date(selectedBooking.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                </span>
              </div>

              {/* Event Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedBooking.service_name}</div>
                    <div className="text-sm text-muted-foreground">{selectedBooking.package_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBooking.event_type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedBooking.package_price.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Kundendaten
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${selectedBooking.customer_email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedBooking.customer_email}
                    </a>
                  </div>
                  {selectedBooking.customer_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${selectedBooking.customer_phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedBooking.customer_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              {(selectedBooking.billing_street || selectedBooking.billing_city) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Rechnungsadresse
                  </h4>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      {selectedBooking.billing_company && (
                        <div className="font-medium">{selectedBooking.billing_company}</div>
                      )}
                      {selectedBooking.billing_name && (
                        <div>{selectedBooking.billing_name}</div>
                      )}
                      {selectedBooking.billing_street && (
                        <div>{selectedBooking.billing_street}</div>
                      )}
                      <div>
                        {selectedBooking.billing_zip} {selectedBooking.billing_city}
                      </div>
                      {selectedBooking.billing_country && (
                        <div>{selectedBooking.billing_country}</div>
                      )}
                      {selectedBooking.billing_vat_id && (
                        <div className="mt-1 text-muted-foreground">
                          UID: {selectedBooking.billing_vat_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedBooking.message && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Notizen
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {selectedBooking.message}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setDetailOpen(false)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
