import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Calendar as CalendarIcon, Package, User, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { trackBookingStep, trackBookingComplete, trackBookingAbandonment } from "@/hooks/useAnalytics";

interface Service {
  id: string;
  title: string;
  slug: string;
  price_from: number | null;
}

interface PackageData {
  id: string;
  name: string;
  duration: string | null;
  price: number;
  base_price: number | null;
  hourly_rate: number | null;
  service_id: string | null;
}

const eventTypes = [
  "Hochzeit",
  "Firmenevent",
  "Geburtstag",
  "Weihnachtsfeier",
  "Jubiläum",
  "Messe/Promotion",
  "Sonstiges",
];

// Generate time options (00:00 - 23:30 in 30min steps)
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      options.push(`${h}:${m}`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export default function Buchen() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    date: undefined as Date | undefined,
    eventType: "",
    timeFrom: "",
    timeTo: "",
    service: "",
    package: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      
      // Fetch admin email
      const { data: emailData } = await supabase
        .from('site_content')
        .select('text_value')
        .eq('section', 'settings')
        .eq('key', 'booking_email')
        .maybeSingle();
      
      if (emailData?.text_value) {
        setAdminEmail(emailData.text_value);
      }
      
      // Fetch services from database
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, title, slug, price_from')
        .eq('is_active', true)
        .order('sort_order');
      
      if (servicesData) {
        setServices(servicesData);
      }
      
      // Fetch packages from database
      const { data: packagesData } = await supabase
        .from('packages')
        .select('id, name, duration, price, base_price, hourly_rate, service_id')
        .eq('is_active', true)
        .order('sort_order');
      
      if (packagesData) {
        setPackages(packagesData);
      }
      
      setLoadingData(false);
    };
    fetchData();
  }, []);

  const stepNames = ['Datum & Event', 'Service & Paket', 'Kontaktdaten', 'Übersicht'];

  const handleNext = () => {
    if (step < 4) {
      const nextStep = step + 1;
      setStep(nextStep);
      trackBookingStep(nextStep, stepNames[nextStep - 1], {
        event_type: formData.eventType,
        service: services.find(s => s.id === formData.service)?.title,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      trackBookingAbandonment(step, stepNames[step - 1], services.find(s => s.id === formData.service)?.title);
      setStep(step - 1);
    }
  };

  // Track initial step on mount
  useEffect(() => {
    trackBookingStep(1, 'Datum & Event');
  }, []);

  // Calculate hours from time selection
  const calculateHours = (from: string, to: string): number => {
    if (!from || !to) return 0;
    
    const [fromH, fromM] = from.split(':').map(Number);
    const [toH, toM] = to.split(':').map(Number);
    
    let fromMinutes = fromH * 60 + fromM;
    let toMinutes = toH * 60 + toM;
    
    // Handle overnight events
    if (toMinutes <= fromMinutes) {
      toMinutes += 24 * 60;
    }
    
    return (toMinutes - fromMinutes) / 60;
  };

  // Calculate total price based on base_price + hourly_rate * hours
  const calculateTotalPrice = (): { total: number; hours: number; basePrice: number; hourlyRate: number } => {
    const selectedPkg = packages.find(p => p.id === formData.package);
    if (!selectedPkg) return { total: 0, hours: 0, basePrice: 0, hourlyRate: 0 };
    
    const basePrice = selectedPkg.base_price || selectedPkg.price || 0;
    const hourlyRate = selectedPkg.hourly_rate || 0;
    const hours = calculateHours(formData.timeFrom, formData.timeTo);
    
    // If no time selected, just show base price
    if (!formData.timeFrom || !formData.timeTo) {
      return { total: basePrice, hours: 0, basePrice, hourlyRate };
    }
    
    const total = basePrice + (hourlyRate * hours);
    return { total, hours, basePrice, hourlyRate };
  };

  const priceDetails = calculateTotalPrice();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedService = services.find(s => s.id === formData.service);
      const selectedPkg = packages.find(p => p.id === formData.package);
      
      const { total: priceNum, hours, basePrice, hourlyRate } = priceDetails;
      
      // Format time info (supports overnight events)
      const timeInfo = formData.timeFrom && formData.timeTo 
        ? `${formData.timeFrom} - ${formData.timeTo}${formData.timeTo < formData.timeFrom ? ' (nächster Tag)' : ''}`
        : '';
      
      const { data, error } = await supabase.functions.invoke('send-booking-email', {
        body: {
          date: formData.date?.toLocaleDateString("de-AT", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          dateRaw: formData.date?.toISOString().split('T')[0],
          eventType: formData.eventType,
          timeFrom: formData.timeFrom,
          timeTo: formData.timeTo,
          timeInfo,
          hours: hours > 0 ? hours : undefined,
          service: selectedService?.title || formData.service,
          packageName: selectedPkg?.name || formData.package,
          packageDuration: selectedPkg?.duration || '',
          packagePrice: `€${priceNum.toFixed(2)}`,
          packagePriceNum: priceNum,
          basePrice,
          hourlyRate,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formData.message || undefined,
          adminEmail: adminEmail || undefined,
        },
      });

      if (error) throw error;

      const customerEmailSent = data?.customerEmailSent !== false;

      // Track successful booking conversion
      trackBookingComplete(
        selectedService?.title || formData.service,
        selectedPkg?.name || formData.package,
        priceNum
      );

      toast({
        title: customerEmailSent
          ? "Buchungsanfrage gesendet!"
          : "Buchungsanfrage gesendet (ohne Bestätigungsmail)",
        description: customerEmailSent
          ? "Wir melden uns innerhalb von 24 Stunden bei Ihnen."
          : "Ihre Anfrage ist bei uns eingegangen – wir melden uns innerhalb von 24 Stunden bei Ihnen.",
      });
      
      setStep(5);
    } catch (error) {
      console.error('Error sending booking:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.date && formData.eventType;
      case 2:
        return formData.service && formData.package;
      case 3:
        return formData.name && formData.email;
      default:
        return true;
    }
  };

  const selectedPackage = formData.package
    ? packages.find(p => p.id === formData.package)
    : null;

  const servicePackages = formData.service
    ? packages.filter(p => p.service_id === formData.service)
    : [];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-8 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
              Jetzt <span className="text-primary">buchen</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Sichern Sie sich Ihren Wunschtermin in nur wenigen Schritten.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          {step < 5 && (
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={cn(
                        "w-12 sm:w-20 h-1 mx-2",
                        step > s ? "bg-primary" : "bg-secondary"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Date & Event Type */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <CalendarIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Wann findet Ihr Event statt?
                </h2>
              </div>
              
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border border-border bg-card"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Uhrzeit (optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Events können auch über Mitternacht gehen (z.B. 20:00 - 02:00)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeFrom" className="text-sm">Von</Label>
                    <Select
                      value={formData.timeFrom}
                      onValueChange={(value) => setFormData({ ...formData, timeFrom: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Startzeit" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeTo" className="text-sm">Bis</Label>
                    <Select
                      value={formData.timeTo}
                      onValueChange={(value) => setFormData({ ...formData, timeTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Endzeit" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.timeFrom && formData.timeTo && formData.timeTo < formData.timeFrom && (
                  <p className="text-sm text-primary">
                    ✓ Event geht über Mitternacht (endet am nächsten Tag)
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base">Art des Events</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, eventType: type })}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        formData.eventType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Service & Package */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Welchen Service wünschen Sie?
                </h2>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Service wählen</Label>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setFormData({ ...formData, service: service.id, package: "" })}
                      className={cn(
                        "p-4 rounded-xl border flex justify-between items-center transition-all",
                        formData.service === service.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium text-foreground">{service.title}</span>
                      <span className="text-primary font-semibold">
                        {service.price_from ? `Ab €${service.price_from}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.service && (
                <div className="space-y-3">
                  <Label className="text-base">Paket wählen</Label>
                  <div className="grid gap-3">
                    {servicePackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setFormData({ ...formData, package: pkg.id })}
                        className={cn(
                          "p-4 rounded-xl border flex justify-between items-center transition-all",
                          formData.package === pkg.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <div>
                          <span className="font-medium text-foreground">{pkg.name}</span>
                          {pkg.duration && (
                            <span className="text-muted-foreground text-sm ml-2">({pkg.duration})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-primary font-semibold">€{pkg.base_price || pkg.price}</span>
                          {(pkg.hourly_rate ?? 0) > 0 && (
                            <span className="text-muted-foreground text-sm block">+€{pkg.hourly_rate}/Std</span>
                          )}
                        </div>
                      </button>
                    ))}
                    {servicePackages.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        Keine Pakete für diesen Service verfügbar.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <User className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Ihre Kontaktdaten
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ihr vollständiger Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ihre@email.at"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+43 660 ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht (optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Besondere Wünsche oder Fragen?"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Check className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Buchungsübersicht
                </h2>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Datum</span>
                  <span className="font-medium text-foreground">
                    {formData.date?.toLocaleDateString("de-AT", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {(formData.timeFrom || formData.timeTo) && (
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Uhrzeit</span>
                    <span className="font-medium text-foreground">
                      {formData.timeFrom} - {formData.timeTo}
                      {formData.timeFrom && formData.timeTo && formData.timeTo < formData.timeFrom && (
                        <span className="text-primary text-sm ml-1">(+1 Tag)</span>
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Event-Art</span>
                  <span className="font-medium text-foreground">{formData.eventType}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">
                    {services.find(s => s.id === formData.service)?.title}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium text-foreground">
                    {selectedPackage?.name} ({selectedPackage?.duration})
                  </span>
                </div>
                {priceDetails.hours > 0 && (
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Dauer</span>
                    <span className="font-medium text-foreground">{priceDetails.hours} Stunden</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">{formData.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">E-Mail</span>
                  <span className="font-medium text-foreground">{formData.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Preis</span>
                  <div className="text-right">
                    {priceDetails.hours > 0 && priceDetails.hourlyRate > 0 ? (
                      <>
                        <span className="text-sm text-muted-foreground block">
                          €{priceDetails.basePrice} + ({priceDetails.hours}h × €{priceDetails.hourlyRate})
                        </span>
                        <span className="font-bold text-xl text-primary">€{priceDetails.total.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-xl text-primary">€{priceDetails.total.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Mit dem Absenden bestätigen Sie, dass wir Sie kontaktieren dürfen.
                Die Buchung ist erst nach unserer Bestätigung verbindlich.
              </p>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Vielen Dank!
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Ihre Buchungsanfrage wurde erfolgreich gesendet. Wir melden uns 
                innerhalb von 24 Stunden bei Ihnen.
              </p>
              <Button asChild size="lg">
                <a href="/">Zurück zur Startseite</a>
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex justify-between mt-12">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              
              {step < 4 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="shadow-gold">
                  {isSubmitting ? (
                    "Wird gesendet..."
                  ) : (
                    <>
                      Anfrage absenden
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
