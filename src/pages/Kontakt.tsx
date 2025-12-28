import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function Kontakt() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Nachricht gesendet!",
      description: "Wir melden uns schnellstmöglich bei Ihnen.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4">
              Kontakt
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Wir freuen uns auf <span className="text-primary">Sie</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Haben Sie Fragen oder möchten Sie ein individuelles Angebot? 
              Kontaktieren Sie uns – wir sind für Sie da.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Nachricht senden
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" placeholder="Ihr Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input id="email" name="email" type="email" placeholder="ihre@email.at" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+43 660 ..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event-Datum</Label>
                  <Input id="eventDate" name="eventDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Betreff *</Label>
                <Input id="subject" name="subject" placeholder="Worum geht es?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Nachricht *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Erzählen Sie uns von Ihrem Event..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full shadow-gold" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Wird gesendet..."
                ) : (
                  <>
                    Nachricht senden
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Kontaktdaten
              </h2>
              <div className="space-y-6">
                <a
                  href="tel:+436602545493"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telefon</p>
                    <p className="text-muted-foreground">+43 660 2545493</p>
                  </div>
                </a>
                <a
                  href="mailto:office@pixelpalast.at"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">E-Mail</p>
                    <p className="text-muted-foreground">office@pixelpalast.at</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Standort</p>
                    <p className="text-muted-foreground">Wien, Österreich</p>
                    <p className="text-sm text-muted-foreground">Einsatzgebiet: Wien & Umgebung, NÖ, Burgenland</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Erreichbarkeit</p>
                    <p className="text-muted-foreground">Mo - Fr: 9:00 - 18:00</p>
                    <p className="text-sm text-muted-foreground">Events auch am Wochenende</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                Schnelle Anfrage?
              </h3>
              <p className="text-muted-foreground mb-4">
                Rufen Sie uns direkt an oder schreiben Sie uns auf WhatsApp für eine schnelle Antwort.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <a href="tel:+436602545493">
                    <Phone className="mr-2 h-4 w-4" />
                    Anrufen
                  </a>
                </Button>
                <Button asChild className="flex-1">
                  <a href="https://wa.me/436602545493" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Map placeholder */}
      <Section variant="muted">
        <div className="bg-secondary rounded-2xl h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Wien, Österreich</p>
            <p className="text-sm text-muted-foreground">Einsatzgebiet: Gesamter Raum Wien & Umgebung</p>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
