import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { EditableText } from '@/components/admin/EditableText';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function AdminKontakt() {
  return (
    <AdminPageWrapper title="Kontakt bearbeiten" publicPath="/kontakt">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <EditableText
              section="kontakt"
              contentKey="hero_subtitle"
              defaultValue="Kontakt"
              className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4"
              as="span"
            />
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              <EditableText
                section="kontakt"
                contentKey="hero_title"
                defaultValue="Wir freuen uns auf Sie"
              />
            </h1>
            <EditableText
              section="kontakt"
              contentKey="hero_description"
              defaultValue="Haben Sie Fragen oder möchten Sie ein individuelles Angebot? Kontaktieren Sie uns – wir sind für Sie da."
              className="text-lg text-muted-foreground leading-relaxed"
              as="p"
              multiline
            />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form Preview */}
          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              <EditableText
                section="kontakt"
                contentKey="form_title"
                defaultValue="Nachricht senden"
              />
            </h2>
            <div className="space-y-6 opacity-60 pointer-events-none">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input placeholder="Ihr Name" disabled />
                </div>
                <div className="space-y-2">
                  <Label>E-Mail *</Label>
                  <Input type="email" placeholder="ihre@email.at" disabled />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input type="tel" placeholder="+43 660 ..." disabled />
                </div>
                <div className="space-y-2">
                  <Label>Event-Datum</Label>
                  <Input type="date" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Betreff *</Label>
                <Input placeholder="Worum geht es?" disabled />
              </div>
              <div className="space-y-2">
                <Label>Nachricht *</Label>
                <Textarea placeholder="Erzählen Sie uns von Ihrem Event..." rows={5} disabled />
              </div>
              <Button size="lg" className="w-full shadow-gold" disabled>
                Nachricht senden
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                <EditableText
                  section="kontakt"
                  contentKey="info_title"
                  defaultValue="Kontaktdaten"
                />
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telefon</p>
                    <EditableText
                      section="kontakt"
                      contentKey="phone"
                      defaultValue="+43 660 2545493"
                      className="text-muted-foreground"
                      as="p"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">E-Mail</p>
                    <EditableText
                      section="kontakt"
                      contentKey="email"
                      defaultValue="office@pixelpalast.at"
                      className="text-muted-foreground"
                      as="p"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Standort</p>
                    <EditableText
                      section="kontakt"
                      contentKey="location"
                      defaultValue="Wien, Österreich"
                      className="text-muted-foreground"
                      as="p"
                    />
                    <EditableText
                      section="kontakt"
                      contentKey="location_detail"
                      defaultValue="Einsatzgebiet: Wien & Umgebung, NÖ, Burgenland"
                      className="text-sm text-muted-foreground"
                      as="p"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Erreichbarkeit</p>
                    <EditableText
                      section="kontakt"
                      contentKey="hours"
                      defaultValue="Mo - Fr: 9:00 - 18:00"
                      className="text-muted-foreground"
                      as="p"
                    />
                    <EditableText
                      section="kontakt"
                      contentKey="hours_detail"
                      defaultValue="Events auch am Wochenende"
                      className="text-sm text-muted-foreground"
                      as="p"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                <EditableText
                  section="kontakt"
                  contentKey="quick_title"
                  defaultValue="Schnelle Anfrage?"
                />
              </h3>
              <EditableText
                section="kontakt"
                contentKey="quick_description"
                defaultValue="Rufen Sie uns direkt an oder schreiben Sie uns auf WhatsApp für eine schnelle Antwort."
                className="text-muted-foreground mb-4"
                as="p"
              />
              <div className="flex flex-col sm:flex-row gap-3 pointer-events-none opacity-60">
                <Button variant="outline" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Anrufen
                </Button>
                <Button className="flex-1">WhatsApp</Button>
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
            <EditableText
              section="kontakt"
              contentKey="map_location"
              defaultValue="Wien, Österreich"
              className="text-muted-foreground"
              as="p"
            />
            <EditableText
              section="kontakt"
              contentKey="map_area"
              defaultValue="Einsatzgebiet: Gesamter Raum Wien & Umgebung"
              className="text-sm text-muted-foreground"
              as="p"
            />
          </div>
        </div>
      </Section>
    </AdminPageWrapper>
  );
}
