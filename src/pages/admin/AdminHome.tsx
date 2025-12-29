import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { EditableText } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { Section, SectionHeader } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, Video, Mic, Sparkles, Users, Zap, Check, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import heroImageFallback from '@/assets/gallery/event-1.jpg';
import event2 from '@/assets/gallery/event-2.jpg';
import event3 from '@/assets/gallery/event-3.jpg';
import event4 from '@/assets/gallery/event-4.jpg';

const serviceImages = [event2, event3, event4];
const serviceKeys = ['photobooth', '360video', 'audio'];
const serviceIcons = [Camera, Video, Mic];

export default function AdminHome() {
  return (
    <AdminPageWrapper title="Startseite bearbeiten" publicPath="/">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
        
        <div className="container relative z-10 text-center max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <EditableText
              section="hero"
              contentKey="subtitle"
              defaultValue="Photobooth & 360° Video"
              className="inline-block text-primary font-medium text-sm tracking-wide"
              as="span"
            />
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-foreground leading-[1.05] tracking-tight mb-6">
            <EditableText
              section="hero"
              contentKey="title_line1"
              defaultValue="Unvergessliche"
            />
            <br />
            <span className="text-gradient">
              <EditableText
                section="hero"
                contentKey="title_line2"
                defaultValue="Erinnerungen"
              />
            </span>
          </h1>
          
          <EditableText
            section="hero"
            contentKey="description"
            defaultValue="Professioneller Photobooth & 360° Video Service für Events, die in Erinnerung bleiben."
            className="text-xl sm:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
            as="p"
            multiline
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-none opacity-60">
            <Button size="lg" className="text-base px-8 h-14 rounded-full shadow-gold">
              <EditableText section="hero" contentKey="cta_primary" defaultValue="Jetzt buchen" />
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="text-base px-8 h-14 rounded-full">
              <EditableText section="hero" contentKey="cta_secondary" defaultValue="Galerie ansehen" />
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-6xl mx-auto mt-16 px-6">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
            <EditableImage
              section="hero"
              contentKey="image"
              defaultSrc={heroImageFallback}
              alt="Hero Bild"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="w-full max-w-4xl mx-auto mt-20 px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
                <EditableText section="stats" contentKey="stat1_value" defaultValue="500+" />
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                <EditableText section="stats" contentKey="stat1_label" defaultValue="Events" />
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
                <EditableText section="stats" contentKey="stat2_value" defaultValue="100%" />
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                <EditableText section="stats" contentKey="stat2_label" defaultValue="Zufriedenheit" />
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
                <EditableText section="stats" contentKey="stat3_value" defaultValue="Wien" />
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                <EditableText section="stats" contentKey="stat3_label" defaultValue="& Umgebung" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <Section>
        <div className="max-w-3xl mb-16 md:mb-20 mx-auto text-center">
          <EditableText
            section="services"
            contentKey="subtitle"
            defaultValue="Unsere Services"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText section="services" contentKey="title" defaultValue="Alles für Ihr Event" />
          </h2>
          <EditableText
            section="services"
            contentKey="description"
            defaultValue="Wählen Sie aus unserem Angebot an modernen Event-Lösungen."
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
            as="p"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[0, 1, 2].map((index) => {
            const Icon = serviceIcons[index];
            const key = serviceKeys[index];
            return (
              <div key={key} className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500">
                <div className="aspect-[4/3] overflow-hidden">
                  <EditableImage
                    section="services"
                    contentKey={`service_${key}_image`}
                    defaultSrc={serviceImages[index]}
                    alt={`Service ${index + 1}`}
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      <EditableText
                        section="services"
                        contentKey={`service_${key}_title`}
                        defaultValue={index === 0 ? 'Photo Booth' : index === 1 ? '360° Video Booth' : 'Audio Gästebuch'}
                      />
                    </h3>
                  </div>
                  <EditableText
                    section="services"
                    contentKey={`service_${key}_description`}
                    defaultValue="Beschreibung hier..."
                    className="text-muted-foreground mb-4 leading-relaxed"
                    as="p"
                    multiline
                  />
                  <div className="flex items-center justify-between">
                    <EditableText
                      section="services"
                      contentKey={`service_${key}_price`}
                      defaultValue="Ab €390"
                      className="text-lg font-semibold text-primary"
                    />
                  </div>
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
            section="benefits"
            contentKey="subtitle"
            defaultValue="Warum wir"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText section="benefits" contentKey="title" defaultValue="Ihre Vorteile" />
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                <EditableText
                  section="benefits"
                  contentKey={`benefit_${index}_title`}
                  defaultValue={`Vorteil ${index + 1}`}
                />
              </h3>
              <EditableText
                section="benefits"
                contentKey={`benefit_${index}_description`}
                defaultValue="Beschreibung..."
                className="text-sm text-muted-foreground"
                as="p"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            <EditableText
              section="cta"
              contentKey="title"
              defaultValue="Bereit loszulegen?"
              className="text-primary-foreground"
            />
          </h2>
          <EditableText
            section="cta"
            contentKey="description"
            defaultValue="Sichern Sie sich jetzt Ihren Wunschtermin."
            className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto"
            as="p"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-none opacity-60">
            <Button size="lg" variant="secondary">Jetzt buchen</Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground">
              Mehr erfahren
            </Button>
          </div>
        </div>
      </Section>
    </AdminPageWrapper>
  );
}
