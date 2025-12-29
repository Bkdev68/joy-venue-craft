import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Calendar as CalendarIcon, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  Mail,
  Phone,
  User,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  date: string;
  event_type: string;
  service_id: string | null;
  package_id: string | null;
  service_name: string;
  package_name: string;
  package_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  title: string;
}

interface Package {
  id: string;
  name: string;
  service_id: string;
  base_price: number | null;
  price: number;
}

const statusOptions = [
  { value: 'pending', label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Bestätigt', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Storniert', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Abgeschlossen', color: 'bg-blue-100 text-blue-800' },
];

const eventTypes = [
  "Hochzeit",
  "Firmenevent",
  "Geburtstag",
  "Weihnachtsfeier",
  "Jubiläum",
  "Messe/Promotion",
  "Sonstiges",
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateOpen, setDateOpen] = useState(false);

  const [form, setForm] = useState({
    date: undefined as Date | undefined,
    event_type: '',
    service_id: '',
    package_id: '',
    service_name: '',
    package_name: '',
    package_price: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: '',
    status: 'pending',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes, packagesRes] = await Promise.all([
        supabase.from('bookings').select('*').order('date', { ascending: false }),
        supabase.from('services').select('id, title').eq('is_active', true),
        supabase.from('packages').select('id, name, service_id, base_price, price').eq('is_active', true),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      setBookings(bookingsRes.data || []);
      setServices(servicesRes.data || []);
      setPackages(packagesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Buchungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingBooking(null);
    setForm({
      date: undefined,
      event_type: '',
      service_id: '',
      package_id: '',
      service_name: '',
      package_name: '',
      package_price: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      message: '',
      status: 'pending',
    });
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setForm({
      date: new Date(booking.date),
      event_type: booking.event_type,
      service_id: booking.service_id || '',
      package_id: booking.package_id || '',
      service_name: booking.service_name,
      package_name: booking.package_name,
      package_price: booking.package_price.toString(),
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone || '',
      message: booking.message || '',
      status: booking.status,
    });
    setDialogOpen(true);
  };

  const handleView = (booking: Booking) => {
    setViewingBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.customer_name || !form.customer_email) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    setSaving(true);

    try {
      const selectedService = services.find(s => s.id === form.service_id);
      const selectedPackage = packages.find(p => p.id === form.package_id);

      const bookingData = {
        date: format(form.date, 'yyyy-MM-dd'),
        event_type: form.event_type,
        service_id: form.service_id || null,
        package_id: form.package_id || null,
        service_name: selectedService?.title || form.service_name || 'Manuell',
        package_name: selectedPackage?.name || form.package_name || 'Manuell',
        package_price: parseFloat(form.package_price) || 0,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone || null,
        message: form.message || null,
        status: form.status,
      };

      if (editingBooking) {
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', editingBooking.id);

        if (error) throw error;
        toast.success('Buchung aktualisiert');
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert(bookingData);

        if (error) throw error;
        toast.success('Buchung erstellt');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Buchung wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      toast.success('Buchung gelöscht');
      fetchData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status aktualisiert');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const servicePackages = form.service_id 
    ? packages.filter(p => p.service_id === form.service_id) 
    : packages;

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find(s => s.value === status);
    return (
      <Badge className={cn('font-medium', statusInfo?.color || 'bg-gray-100 text-gray-800')}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const exportBookings = () => {
    const csvContent = [
      ['Datum', 'Event', 'Service', 'Paket', 'Preis', 'Name', 'Email', 'Telefon', 'Status'].join(';'),
      ...filteredBookings.map(b => [
        b.date,
        b.event_type,
        b.service_name,
        b.package_name,
        b.package_price,
        b.customer_name,
        b.customer_email,
        b.customer_phone || '',
        b.status,
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buchungen_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buchungen</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie alle Buchungsanfragen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBookings}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buchung hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBooking ? 'Buchung bearbeiten' : 'Neue Buchung'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Datum *</Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date ? format(form.date, 'PPP', { locale: de }) : 'Datum wählen'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.date}
                          onSelect={(date) => {
                            setForm(prev => ({ ...prev, date }));
                            setDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Event-Art</Label>
                    <Select
                      value={form.event_type}
                      onValueChange={(value) => setForm(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select
                      value={form.service_id}
                      onValueChange={(value) => setForm(prev => ({ 
                        ...prev, 
                        service_id: value,
                        package_id: '' // Reset package when service changes
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Service wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>{service.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Paket</Label>
                    <Select
                      value={form.package_id}
                      onValueChange={(value) => {
                        const pkg = packages.find(p => p.id === value);
                        setForm(prev => ({ 
                          ...prev, 
                          package_id: value,
                          package_price: pkg ? (pkg.base_price || pkg.price).toString() : prev.package_price
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Paket wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {servicePackages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - €{pkg.base_price || pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preis (€)</Label>
                    <Input
                      type="number"
                      value={form.package_price}
                      onChange={(e) => setForm(prev => ({ ...prev, package_price: e.target.value }))}
                      placeholder="z.B. 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Kundendaten</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={form.customer_name}
                        onChange={(e) => setForm(prev => ({ ...prev, customer_name: e.target.value }))}
                        placeholder="Vollständiger Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={form.customer_email}
                        onChange={(e) => setForm(prev => ({ ...prev, customer_email: e.target.value }))}
                        placeholder="email@beispiel.at"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Telefon</Label>
                    <Input
                      value={form.customer_phone}
                      onChange={(e) => setForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                      placeholder="+43 660 ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nachricht / Notizen</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Besondere Wünsche, interne Notizen..."
                    rows={3}
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name, Email oder Service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-sm text-muted-foreground">Bestätigt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  €{bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.package_price, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Umsatz (bestätigt)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Buchungen ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Buchungen gefunden.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-muted px-3 py-2 rounded-lg min-w-[70px]">
                      <p className="text-lg font-bold">{format(new Date(booking.date), 'd')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(booking.date), 'MMM', { locale: de })}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.customer_name}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.service_name} • {booking.package_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.event_type} • €{booking.package_price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateStatus(booking.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => handleView(booking)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(booking)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(booking.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buchungsdetails</DialogTitle>
          </DialogHeader>
          {viewingBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingBooking.status)}
                <span className="text-muted-foreground text-sm">
                  Erstellt: {format(new Date(viewingBooking.created_at), 'PPp', { locale: de })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Datum
                  </p>
                  <p className="font-medium">{format(new Date(viewingBooking.date), 'PPP', { locale: de })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Event-Art</p>
                  <p className="font-medium">{viewingBooking.event_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{viewingBooking.service_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Paket</p>
                  <p className="font-medium">{viewingBooking.package_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Euro className="h-3 w-3" /> Preis
                  </p>
                  <p className="font-medium text-lg text-primary">€{viewingBooking.package_price}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Kundendaten</h4>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {viewingBooking.customer_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${viewingBooking.customer_email}`} className="text-primary hover:underline">
                      {viewingBooking.customer_email}
                    </a>
                  </p>
                  {viewingBooking.customer_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${viewingBooking.customer_phone}`} className="text-primary hover:underline">
                        {viewingBooking.customer_phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {viewingBooking.message && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Nachricht
                  </h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg text-sm">
                    {viewingBooking.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleEdit(viewingBooking)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
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
