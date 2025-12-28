import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Calendar as CalendarIcon, Package, User, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  { id: "photobooth", name: "Photo Booth", price: "Ab €390" },
  { id: "360video", name: "360° Video Booth", price: "Ab €490" },
  { id: "audio", name: "Audio Gästebuch", price: "Ab €290" },
];

const packages = {
  photobooth: [
    { id: "starter", name: "Starter", duration: "2 Stunden", price: "€390" },
    { id: "classic", name: "Classic", duration: "4 Stunden", price: "€590" },
    { id: "premium", name: "Premium", duration: "6 Stunden", price: "€790" },
  ],
  "360video": [
    { id: "starter", name: "Starter", duration: "2 Stunden", price: "€490" },
    { id: "classic", name: "Classic", duration: "4 Stunden", price: "€790" },
    { id: "premium", name: "Premium", duration: "6 Stunden", price: "€1090" },
  ],
  audio: [
    { id: "komplett", name: "Komplett-Paket", duration: "Ganzer Tag", price: "€290" },
  ],
};

const eventTypes = [
  "Hochzeit",
  "Firmenevent",
  "Geburtstag",
  "Weihnachtsfeier",
  "Jubiläum",
  "Messe/Promotion",
  "Sonstiges",
];

export default function Buchen() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: undefined as Date | undefined,
    eventType: "",
    service: "",
    package: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Buchungsanfrage gesendet!",
      description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    });
    
    setIsSubmitting(false);
    setStep(5); // Success step
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

  const selectedPackage = formData.service && formData.package
    ? packages[formData.service as keyof typeof packages]?.find(p => p.id === formData.package)
    : null;

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
                      <span className="font-medium text-foreground">{service.name}</span>
                      <span className="text-primary font-semibold">{service.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.service && (
                <div className="space-y-3">
                  <Label className="text-base">Paket wählen</Label>
                  <div className="grid gap-3">
                    {packages[formData.service as keyof typeof packages]?.map((pkg) => (
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
                          <span className="text-muted-foreground text-sm ml-2">({pkg.duration})</span>
                        </div>
                        <span className="text-primary font-semibold">{pkg.price}</span>
                      </button>
                    ))}
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
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Event-Art</span>
                  <span className="font-medium text-foreground">{formData.eventType}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">
                    {services.find(s => s.id === formData.service)?.name}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium text-foreground">
                    {selectedPackage?.name} ({selectedPackage?.duration})
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">{formData.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">E-Mail</span>
                  <span className="font-medium text-foreground">{formData.email}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Preis</span>
                  <span className="font-bold text-xl text-primary">{selectedPackage?.price}</span>
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
