import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  CalendarPlus,
  Users
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
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
  venue: string | null;
  event_time: string | null;
  billing_company: string | null;
  billing_name: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_vat_id: string | null;
  assigned_staff: string[] | null;
  custom_staff: string | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  event_type: string;
  color: string;
  is_all_day: boolean;
  location: string | null;
  google_calendar_event_id: string | null;
}

interface CalendarEntry {
  id: string;
  type: 'booking' | 'event';
  title: string;
  date: string;
  time?: string | null;
  color: string;
  data: Booking | CalendarEvent;
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

const eventColors = [
  { name: 'Blau', value: '#3b82f6' },
  { name: 'Grün', value: '#22c55e' },
  { name: 'Rot', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Lila', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Türkis', value: '#14b8a6' },
  { name: 'Gelb', value: '#eab308' },
];

export default function AdminKalender() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form state for new/edit event
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    end_time: '',
    color: '#3b82f6',
    is_all_day: false,
    location: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bookings and events in parallel
      const [bookingsRes, eventsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .in('status', ['confirmed', 'completed', 'pending'])
          .order('date', { ascending: true }),
        supabase
          .from('calendar_events')
          .select('*')
          .order('event_date', { ascending: true })
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setBookings(bookingsRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEntriesForDay = (day: Date): CalendarEntry[] => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    const bookingEntries: CalendarEntry[] = bookings
      .filter(b => b.date === dateStr)
      .map(b => ({
        id: b.id,
        type: 'booking' as const,
        title: b.customer_name,
        date: b.date,
        time: b.event_time,
        color: statusColors[b.status] || 'bg-gray-500',
        data: b
      }));

    const eventEntries: CalendarEntry[] = events
      .filter(e => e.event_date === dateStr)
      .map(e => ({
        id: e.id,
        type: 'event' as const,
        title: e.title,
        date: e.event_date,
        time: e.event_time,
        color: e.color,
        data: e
      }));

    return [...bookingEntries, ...eventEntries];
  };

  const handleEntryClick = (entry: CalendarEntry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEventForm({
      ...eventForm,
      event_date: format(day, 'yyyy-MM-dd')
    });
    setEditingEvent(null);
    setEventDialogOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedDate(new Date());
    setEventForm({
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      event_time: '',
      end_time: '',
      color: '#3b82f6',
      is_all_day: false,
      location: ''
    });
    setEditingEvent(null);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      end_time: event.end_time || '',
      color: event.color,
      is_all_day: event.is_all_day,
      location: event.location || ''
    });
    setDetailOpen(false);
    setEventDialogOpen(true);
  };

  const syncToGoogleCalendar = async (
    action: 'create' | 'update' | 'delete',
    eventData: CalendarEvent
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action,
          type: 'calendar_event',
          calendarEvent: {
            id: eventData.id,
            title: eventData.title,
            description: eventData.description,
            event_date: eventData.event_date,
            event_time: eventData.event_time,
            end_time: eventData.end_time,
            color: eventData.color,
            is_all_day: eventData.is_all_day,
            location: eventData.location,
            google_calendar_event_id: eventData.google_calendar_event_id
          }
        }
      });

      if (error) {
        console.error('Google Calendar sync error:', error);
        return;
      }

      if (data?.success) {
        console.log('Google Calendar sync successful:', data.message);
      }
    } catch (error) {
      console.error('Failed to sync with Google Calendar:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Find the event to get its Google Calendar ID
      const eventToDelete = events.find(e => e.id === eventId);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Sync deletion to Google Calendar
      if (eventToDelete) {
        await syncToGoogleCalendar('delete', eventToDelete);
      }

      toast.success('Termin gelöscht');
      setDetailOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description || null,
        event_date: eventForm.event_date,
        event_time: eventForm.is_all_day ? null : (eventForm.event_time || null),
        end_time: eventForm.is_all_day ? null : (eventForm.end_time || null),
        color: eventForm.color,
        is_all_day: eventForm.is_all_day,
        location: eventForm.location || null,
        event_type: 'custom'
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;

        // Sync update to Google Calendar
        await syncToGoogleCalendar('update', {
          ...eventData,
          id: editingEvent.id,
          google_calendar_event_id: editingEvent.google_calendar_event_id
        } as CalendarEvent);

        toast.success('Termin aktualisiert');
      } else {
        const { data: insertedEvent, error } = await supabase
          .from('calendar_events')
          .insert(eventData)
          .select()
          .single();

        if (error) throw error;

        // Sync creation to Google Calendar
        if (insertedEvent) {
          await syncToGoogleCalendar('create', insertedEvent as CalendarEvent);
        }

        toast.success('Termin erstellt');
      }

      setEventDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const weekDaysFull = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  const allEntries = [
    ...bookings.map(b => ({
      id: b.id,
      type: 'booking' as const,
      title: b.customer_name,
      date: b.date,
      time: b.event_time,
      color: statusColors[b.status] || 'bg-gray-500',
      data: b
    })),
    ...events.map(e => ({
      id: e.id,
      type: 'event' as const,
      title: e.title,
      date: e.event_date,
      time: e.event_time,
      color: e.color,
      data: e
    }))
  ].filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Kalender</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Übersicht aller Termine und Aufträge
            </p>
          </div>
          <Button onClick={handleAddEvent} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Termin hinzufügen
          </Button>
        </div>
        
        {/* Legend - horizontal scrolling on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <Badge variant="outline" className="gap-1 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Bestätigt
          </Badge>
          <Badge variant="outline" className="gap-1 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Abgeschlossen
          </Badge>
          <Badge variant="outline" className="gap-1 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            Ausstehend
          </Badge>
          <Badge variant="outline" className="gap-1 flex-shrink-0">
            <CalendarPlus className="h-3 w-3" />
            Eigene
          </Badge>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 px-3 md:px-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base md:text-xl">
              {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </CardTitle>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 md:px-6 pb-3 md:pb-6">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
            {weekDays.map((day, idx) => (
              <div 
                key={day} 
                className="text-center text-[10px] md:text-sm font-medium text-muted-foreground py-1 md:py-2"
                title={weekDaysFull[idx]}
              >
                <span className="md:hidden">{day}</span>
                <span className="hidden md:inline">{weekDaysFull[idx].slice(0, 2)}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1">
            {calendarDays.map(day => {
              const dayEntries = getEntriesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[52px] md:min-h-[100px] p-0.5 md:p-1 border rounded-md transition-colors cursor-pointer hover:bg-muted/50",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isToday && "border-primary border-2 bg-primary/5",
                    dayEntries.length > 0 && isCurrentMonth && "bg-accent/30"
                  )}
                >
                  <div className={cn(
                    "text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 text-right pr-0.5 md:pr-1",
                    isToday && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Mobile: Show dots only */}
                  <div className="md:hidden flex flex-wrap gap-0.5 justify-center">
                    {dayEntries.slice(0, 4).map(entry => (
                      <div
                        key={entry.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEntryClick(entry);
                        }}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          entry.type === 'booking' ? entry.color : ''
                        )}
                        style={entry.type === 'event' ? { backgroundColor: entry.color } : {}}
                      />
                    ))}
                    {dayEntries.length > 4 && (
                      <div className="text-[8px] text-muted-foreground">+{dayEntries.length - 4}</div>
                    )}
                  </div>

                  {/* Desktop: Show entries */}
                  <div className="hidden md:block space-y-0.5">
                    {dayEntries.slice(0, 3).map(entry => (
                      <button
                        key={entry.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEntryClick(entry);
                        }}
                        className={cn(
                          "w-full text-left text-[10px] px-1 py-0.5 rounded truncate text-white transition-opacity hover:opacity-80",
                          entry.type === 'booking' ? entry.color : ''
                        )}
                        style={entry.type === 'event' ? { backgroundColor: entry.color } : {}}
                        title={entry.title}
                      >
                        {entry.time && <span className="mr-1 opacity-75">{entry.time.slice(0,5)}</span>}
                        {entry.title}
                      </button>
                    ))}
                    {dayEntries.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{dayEntries.length - 3} mehr
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events - Cards on Mobile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5" />
            Kommende Termine
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-2 md:space-y-3">
            {allEntries
              .slice(0, 5)
              .map(entry => (
                <button
                  key={entry.id}
                  onClick={() => handleEntryClick(entry)}
                  className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <div 
                    className={cn(
                      "w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0",
                      entry.type === 'booking' ? entry.color : ''
                    )}
                    style={entry.type === 'event' ? { backgroundColor: entry.color } : {}}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm md:text-base truncate">{entry.title}</div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">
                      {entry.type === 'booking' 
                        ? `${(entry.data as Booking).service_name} • ${(entry.data as Booking).package_name}`
                        : (entry.data as CalendarEvent).location || 'Eigener Termin'
                      }
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs md:text-sm font-medium">
                      {format(new Date(entry.date), 'dd. MMM', { locale: de })}
                    </div>
                    {entry.time && (
                      <div className="text-[10px] md:text-xs text-muted-foreground">
                        {entry.time.slice(0, 5)} Uhr
                      </div>
                    )}
                  </div>
                </button>
              ))}
            {allEntries.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Keine kommenden Termine
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
              {selectedEntry?.type === 'booking' ? 'Auftragsdetails' : 'Termindetails'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry?.type === 'booking' && (() => {
            const booking = selectedEntry.data as Booking;
            return (
              <div className="space-y-4">
                {/* Status & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Badge className={cn("text-white w-fit", statusColors[booking.status])}>
                    {statusLabels[booking.status]}
                  </Badge>
                  <span className="text-sm font-medium">
                    {format(new Date(booking.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                  </span>
                </div>

                {/* Event Info */}
                <div className="space-y-3 p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm md:text-base">{booking.service_name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">{booking.package_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{booking.event_type}</span>
                  </div>
                  {booking.event_time && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.event_time} Uhr</span>
                    </div>
                  )}
                  {booking.venue && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Euro className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm">
                      {booking.package_price.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                    Kundendaten
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${booking.customer_email}`}
                        className="text-primary hover:underline text-sm truncate"
                      >
                        {booking.customer_email}
                      </a>
                    </div>
                    {booking.customer_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a 
                          href={`tel:${booking.customer_phone}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {booking.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Staff */}
                {((booking.assigned_staff && booking.assigned_staff.length > 0) || booking.custom_staff) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs md:text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Zugewiesene Mitarbeiter
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.assigned_staff?.map(name => (
                        <Badge key={name} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                      {booking.custom_staff && (
                        <Badge variant="outline" className="text-xs">
                          {booking.custom_staff}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                {booking.message && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                      Notizen
                    </h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {booking.message}
                    </p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setDetailOpen(false)}
                >
                  Schließen
                </Button>
              </div>
            );
          })()}

          {selectedEntry?.type === 'event' && (() => {
            const event = selectedEntry.data as CalendarEvent;
            return (
              <div className="space-y-4">
                {/* Title with color */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                </div>

                {/* Date & Time */}
                <div className="space-y-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      {format(new Date(event.event_date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                    </span>
                  </div>
                  {!event.is_all_day && event.event_time && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">
                        {event.event_time.slice(0, 5)} Uhr
                        {event.end_time && ` – ${event.end_time.slice(0, 5)} Uhr`}
                      </span>
                    </div>
                  )}
                  {event.is_all_day && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Ganztägig</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                      Beschreibung
                    </h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              {editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="z.B. Kundentermin, Wartung..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Datum *</Label>
              <Input
                id="event_date"
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_all_day">Ganztägig</Label>
              <Switch
                id="is_all_day"
                checked={eventForm.is_all_day}
                onCheckedChange={(checked) => setEventForm({ ...eventForm, is_all_day: checked })}
              />
            </div>

            {!eventForm.is_all_day && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="event_time">Von</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={eventForm.event_time}
                    onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Bis</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="z.B. Wien, Büro..."
              />
            </div>

            <div className="space-y-2">
              <Label>Farbe</Label>
              <div className="flex flex-wrap gap-2">
                {eventColors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEventForm({ ...eventForm, color: color.value })}
                    className={cn(
                      "w-7 h-7 md:w-8 md:h-8 rounded-full transition-all",
                      eventForm.color === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Optionale Notizen..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveEvent}>
              {editingEvent ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}