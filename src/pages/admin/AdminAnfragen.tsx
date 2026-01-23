import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building2,
  Search,
  Eye,
  CheckCircle,
  Circle,
  Filter,
  Inbox,
  MessageSquare,
  Calculator,
  Sparkles,
  Copy,
  Check,
  Send,
  Loader2,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { PriceCalculator } from '@/components/admin/PriceCalculator';

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  source: string;
  venue: string | null;
  rental_object: string | null;
  event_type: string | null;
  event_date: string | null;
  event_time: string | null;
  duration_hours: number | null;
  referral_sources: string[] | null;
  customer_type: string | null;
  company_name: string | null;
  company_street: string | null;
  company_zip: string | null;
  company_city: string | null;
  company_country: string | null;
  is_read: boolean | null;
  created_at: string;
};

export default function AdminAnfragen() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  
  // AI Response states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiType, setAiType] = useState<'offer' | 'email'>('offer');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiSubmission, setAiSubmission] = useState<ContactSubmission | null>(null);
  const [copied, setCopied] = useState(false);
  const [sendingAiEmail, setSendingAiEmail] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success('Status aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren');
    },
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesSource = filterSource === 'all' || s.source === filterSource;
    const matchesType = filterType === 'all' || s.customer_type === filterType;
    const matchesRead = 
      filterRead === 'all' || 
      (filterRead === 'unread' && !s.is_read) || 
      (filterRead === 'read' && s.is_read);
    
    return matchesSearch && matchesSource && matchesType && matchesRead;
  });

  const unreadCount = submissions.filter(s => !s.is_read).length;

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (!submission.is_read) {
      markAsReadMutation.mutate({ id: submission.id, is_read: true });
    }
  };

  const getRentalObjectLabel = (obj: string) => {
    const labels: Record<string, string> = {
      photobooth: 'Photo Booth',
      videobooth360: '360° Video Booth',
      audioguestbook: 'Audio Gästebuch',
    };
    return obj.split(', ').map(o => labels[o.trim()] || o).join(', ');
  };

  // Generate AI offer or email response
  const generateAIResponse = async (submission: ContactSubmission, type: 'offer' | 'email') => {
    setAiSubmission(submission);
    setAiType(type);
    setAiContent('');
    setAiDialogOpen(true);
    setAiLoading(true);
    setCopied(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          booking: {
            customer_name: submission.name,
            customer_email: submission.email,
            customer_phone: submission.phone,
            customer_type: submission.customer_type,
            company_name: submission.company_name,
            date: submission.event_date,
            event_type: submission.event_type,
            event_time: submission.event_time,
            duration_hours: submission.duration_hours,
            venue: submission.venue,
            service_name: submission.rental_object ? getRentalObjectLabel(submission.rental_object) : 'Nicht angegeben',
            package_name: 'Anfrage',
            package_price: calculatedPrice || 0,
            message: submission.message,
            referral_sources: submission.referral_sources,
          },
          type,
          calculatedPrice: calculatedPrice || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Generieren');
      }

      if (result.success && result.content) {
        setAiContent(result.content);
      } else {
        throw new Error(result.error || 'Keine Antwort erhalten');
      }
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      toast.error('Fehler: ' + (error.message || 'Unbekannter Fehler'));
      setAiDialogOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiContent);
      setCopied(true);
      toast.success('In Zwischenablage kopiert');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  // Send AI-generated content via email
  const sendAIEmail = async () => {
    if (!aiSubmission || !aiContent) return;
    
    setSendingAiEmail(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-ai-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to: aiSubmission.email,
          customerName: aiSubmission.name,
          content: aiContent,
          type: aiType,
          eventType: aiSubmission.event_type,
          eventDate: aiSubmission.event_date,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Senden');
      }

      toast.success(`${aiType === 'offer' ? 'Angebot' : 'Antwort'} an ${aiSubmission.email} gesendet!`);
      setAiDialogOpen(false);
      
      // Mark as read after sending response
      if (!aiSubmission.is_read) {
        markAsReadMutation.mutate({ id: aiSubmission.id, is_read: true });
      }
    } catch (error: any) {
      console.error('Error sending AI email:', error);
      toast.error('Fehler beim Senden: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setSendingAiEmail(false);
    }
  };

  return (
    <AdminPageWrapper title="Kontaktanfragen">
      <Section>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ungelesen</CardTitle>
              <Circle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Embed-Anfragen</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.source === 'embed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name, E-Mail oder Firma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Quelle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Quellen</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="embed">Embed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="privat">Privat</SelectItem>
              <SelectItem value="firma">Firma</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="unread">Ungelesen</SelectItem>
              <SelectItem value="read">Gelesen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Name / Kontakt</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Mietobjekt</TableHead>
                <TableHead>Quelle</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Lade Anfragen...
                  </TableCell>
                </TableRow>
              ) : filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Keine Anfragen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow 
                    key={submission.id}
                    className={!submission.is_read ? 'bg-primary/5' : ''}
                  >
                    <TableCell>
                      {!submission.is_read ? (
                        <Circle className="h-3 w-3 fill-primary text-primary" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{submission.name}</div>
                      <div className="text-sm text-muted-foreground">{submission.email}</div>
                      {submission.company_name && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {submission.company_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.event_type && (
                        <div className="text-sm">{submission.event_type}</div>
                      )}
                      {submission.event_date && (
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(submission.event_date), 'dd.MM.yyyy', { locale: de })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.rental_object && (
                        <div className="text-sm">
                          {getRentalObjectLabel(submission.rental_object)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.source === 'embed' ? 'default' : 'secondary'}>
                        {submission.source === 'embed' ? 'Embed' : 'Website'}
                      </Badge>
                      {submission.customer_type && (
                        <Badge variant="outline" className="ml-1">
                          {submission.customer_type === 'firma' ? 'Firma' : 'Privat'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(submission.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anfrage Details</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Kontaktdaten
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div className="font-medium">{selectedSubmission.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Typ:</span>
                    <div className="font-medium">
                      {selectedSubmission.customer_type === 'firma' ? 'Firma' : 'Privat'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedSubmission.email}`} className="text-primary hover:underline">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  {selectedSubmission.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedSubmission.phone}`} className="text-primary hover:underline">
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info */}
              {selectedSubmission.customer_type === 'firma' && selectedSubmission.company_name && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Firmenadresse
                  </h3>
                  <div className="text-sm">
                    <div className="font-medium">{selectedSubmission.company_name}</div>
                    {selectedSubmission.company_street && <div>{selectedSubmission.company_street}</div>}
                    {(selectedSubmission.company_zip || selectedSubmission.company_city) && (
                      <div>{selectedSubmission.company_zip} {selectedSubmission.company_city}</div>
                    )}
                    {selectedSubmission.company_country && <div>{selectedSubmission.company_country}</div>}
                  </div>
                </div>
              )}

              {/* Event Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Eventdetails
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedSubmission.rental_object && (
                    <div>
                      <span className="text-muted-foreground">Mietobjekt:</span>
                      <div className="font-medium">{getRentalObjectLabel(selectedSubmission.rental_object)}</div>
                    </div>
                  )}
                  {selectedSubmission.event_type && (
                    <div>
                      <span className="text-muted-foreground">Eventart:</span>
                      <div className="font-medium">{selectedSubmission.event_type}</div>
                    </div>
                  )}
                  {selectedSubmission.event_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(selectedSubmission.event_date), 'dd.MM.yyyy', { locale: de })}</span>
                    </div>
                  )}
                  {selectedSubmission.event_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSubmission.event_time} Uhr</span>
                    </div>
                  )}
                  {selectedSubmission.duration_hours && (
                    <div>
                      <span className="text-muted-foreground">Dauer:</span>
                      <div className="font-medium">{selectedSubmission.duration_hours} Stunden</div>
                    </div>
                  )}
                  {selectedSubmission.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSubmission.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Referral Sources */}
              {selectedSubmission.referral_sources && selectedSubmission.referral_sources.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Wie gefunden?</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.referral_sources.map((source) => (
                      <Badge key={source} variant="secondary" className="capitalize">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="space-y-3">
                <h3 className="font-semibold">Nachricht</h3>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Price Calculator */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Preiskalkulation
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPriceCalculator(!showPriceCalculator)}
                  >
                    {showPriceCalculator ? 'Ausblenden' : 'Preis berechnen'}
                  </Button>
                </div>
                {showPriceCalculator && (
                  <PriceCalculator
                    compact={false}
                    initialHours={selectedSubmission.duration_hours || undefined}
                    onPriceCalculated={(price) => setCalculatedPrice(price)}
                  />
                )}
                {calculatedPrice > 0 && (
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    Kalkulierter Preis: €{calculatedPrice.toLocaleString('de-DE')}
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                <div>
                  Quelle: <Badge variant="outline">{selectedSubmission.source}</Badge>
                </div>
                <div>
                  Eingegangen: {format(new Date(selectedSubmission.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    markAsReadMutation.mutate({ 
                      id: selectedSubmission.id, 
                      is_read: !selectedSubmission.is_read 
                    });
                    setSelectedSubmission({
                      ...selectedSubmission,
                      is_read: !selectedSubmission.is_read
                    });
                  }}
                >
                  {selectedSubmission.is_read ? (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Als ungelesen
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Als gelesen
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => generateAIResponse(selectedSubmission, 'offer')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Angebot erstellen
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => generateAIResponse(selectedSubmission, 'email')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Antwort generieren
                </Button>
                
                <Button asChild>
                  <a href={`mailto:${selectedSubmission.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    E-Mail öffnen
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Response Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {aiType === 'offer' ? 'Angebot erstellen' : 'Antwort generieren'}
            </DialogTitle>
          </DialogHeader>
          
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">KI generiert {aiType === 'offer' ? 'Angebot' : 'Antwort'}...</p>
            </div>
          ) : aiContent ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm font-mono max-h-[50vh] overflow-y-auto">
                {aiContent}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Kopiert!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Kopieren
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={sendAIEmail}
                  disabled={sendingAiEmail}
                  className="flex-1"
                >
                  {sendingAiEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Senden...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      An {aiSubmission?.email} senden
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}
