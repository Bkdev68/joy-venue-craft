import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { EditableText } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { Section, SectionHeader } from '@/components/ui/section';
import { Camera, Video, Mic, Sparkles, Users, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import event2 from '@/assets/gallery/event-2.jpg';
import event3 from '@/assets/gallery/event-3.jpg';
import event4 from '@/assets/gallery/event-4.jpg';

const serviceIcons = [Camera, Video, Mic];
const serviceImages = [event2, event3, event4];
const serviceKeys = ['photobooth', '360video', 'audio'];

const benefitIcons = [Sparkles, Users, Zap];

export default function AdminLeistungen() {
  return (
    <AdminPageWrapper title="Leistungen bearbeiten" publicPath="/leistungen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <EditableText
              section="leistungen"
              contentKey="hero_subtitle"
              defaultValue="Unsere Leistungen"
              className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4"
              as="span"
            />
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              <EditableText
                section="leistungen"
                contentKey="hero_title"
                defaultValue="Unvergessliche Erlebnisse für jeden Anlass"
              />
            </h1>
            <EditableText
              section="leistungen"
              contentKey="hero_description"
              defaultValue="Von klassischen Photo Booths bis hin zu modernen 360°-Video-Erlebnissen – wir bieten maßgeschneiderte Lösungen für Ihre Veranstaltung."
              className="text-lg text-muted-foreground leading-relaxed"
              as="p"
              multiline
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <div className="space-y-24">
          {[0, 1, 2].map((index) => {
            const Icon = serviceIcons[index];
            const key = serviceKeys[index];
            return (
              <div
                key={key}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                    <EditableImage
                      section="leistungen"
                      contentKey={`service_${key}_image`}
                      defaultSrc={serviceImages[index]}
                      alt={`Service ${index + 1}`}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-foreground">
                      <EditableText
                        section="leistungen"
                        contentKey={`service_${key}_title`}
                        defaultValue={index === 0 ? 'Photo Booth' : index === 1 ? '360° Video Booth' : 'Audio Gästebuch'}
                      />
                    </h2>
                  </div>
                  <EditableText
                    section="leistungen"
                    contentKey={`service_${key}_description`}
                    defaultValue="Beschreibung des Services hier eingeben..."
                    className="text-lg text-muted-foreground mb-6 leading-relaxed"
                    as="p"
                    multiline
                  />
                  <div className="text-sm text-muted-foreground mb-4">
                    Features werden über den Services-Bereich im Admin verwaltet.
                  </div>
                  <Button size="lg" className="shadow-gold pointer-events-none opacity-60">
                    Mehr erfahren
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Benefits */}
      <Section variant="muted">
        <div className="max-w-3xl mb-16 md:mb-20 mx-auto text-center">
          <EditableText
            section="leistungen"
            contentKey="benefits_subtitle"
            defaultValue="Warum Pixelpalast"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText
              section="leistungen"
              contentKey="benefits_title"
              defaultValue="Ihre Vorteile auf einen Blick"
            />
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[0, 1, 2].map((index) => {
            const Icon = benefitIcons[index];
            return (
              <div
                key={index}
                className="bg-card p-8 rounded-2xl border border-border text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  <EditableText
                    section="leistungen"
                    contentKey={`benefit_${index}_title`}
                    defaultValue={index === 0 ? 'Premium Qualität' : index === 1 ? 'Erfahrenes Team' : 'Schnelle Lieferung'}
                  />
                </h3>
                <EditableText
                  section="leistungen"
                  contentKey={`benefit_${index}_description`}
                  defaultValue="Beschreibung hier..."
                  className="text-muted-foreground"
                  as="p"
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            <EditableText
              section="leistungen"
              contentKey="cta_title"
              defaultValue="Bereit für unvergessliche Momente?"
              className="text-primary-foreground"
            />
          </h2>
          <EditableText
            section="leistungen"
            contentKey="cta_description"
            defaultValue="Kontaktieren Sie uns noch heute und lassen Sie uns gemeinsam Ihre Veranstaltung planen."
            className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto"
            as="p"
            multiline
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-none opacity-60">
            <Button size="lg" variant="secondary">Jetzt buchen</Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground">
              Kontakt aufnehmen
            </Button>
          </div>
        </div>
      </Section>
    </AdminPageWrapper>
  );
}
