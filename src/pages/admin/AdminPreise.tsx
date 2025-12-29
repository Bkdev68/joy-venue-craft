import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { EditableText } from '@/components/admin/EditableText';
import { Section, SectionHeader } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Check, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AdminPreise() {
  return (
    <AdminPageWrapper title="Preise bearbeiten" publicPath="/preise">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <EditableText
              section="preise"
              contentKey="hero_subtitle"
              defaultValue="Preise & Pakete"
              className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4"
              as="span"
            />
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              <EditableText
                section="preise"
                contentKey="hero_title"
                defaultValue="Transparente Preise"
              />
            </h1>
            <EditableText
              section="preise"
              contentKey="hero_description"
              defaultValue="Wählen Sie das passende Paket für Ihr Event. Alle Preise verstehen sich inklusive Auf- und Abbau sowie einem erfahrenen Mitarbeiter."
              className="text-lg text-muted-foreground leading-relaxed"
              as="p"
              multiline
            />
          </div>
        </div>
      </section>

      {/* Photo Booth Packages */}
      <Section>
        <div className="max-w-3xl mb-16 md:mb-20 mx-auto text-center">
          <EditableText
            section="preise"
            contentKey="photobooth_subtitle"
            defaultValue="Photo Booth"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText
              section="preise"
              contentKey="photobooth_title"
              defaultValue="Photo Booth Pakete"
            />
          </h2>
          <EditableText
            section="preise"
            contentKey="photobooth_description"
            defaultValue="Klassische Fotobox mit Sofortdruck und digitaler Galerie."
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
            as="p"
          />
        </div>
        <div className="bg-muted/30 rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">
            Pakete werden über den <strong>Services-Bereich</strong> im Admin verwaltet.
          </p>
        </div>
      </Section>

      {/* 360° Video Booth Packages */}
      <Section variant="muted">
        <div className="max-w-3xl mb-16 md:mb-20 mx-auto text-center">
          <EditableText
            section="preise"
            contentKey="video360_subtitle"
            defaultValue="360° Video Booth"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText
              section="preise"
              contentKey="video360_title"
              defaultValue="360° Video Booth Pakete"
            />
          </h2>
          <EditableText
            section="preise"
            contentKey="video360_description"
            defaultValue="Spektakuläre 360-Grad-Videos mit Slow-Motion-Effekten."
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
            as="p"
          />
        </div>
        <div className="bg-background rounded-2xl p-8 text-center border">
          <p className="text-muted-foreground">
            Pakete werden über den <strong>Services-Bereich</strong> im Admin verwaltet.
          </p>
        </div>
      </Section>

      {/* Audio Guestbook */}
      <Section>
        <div className="max-w-3xl mb-16 md:mb-20 mx-auto text-center">
          <EditableText
            section="preise"
            contentKey="audio_subtitle"
            defaultValue="Audio Gästebuch"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText
              section="preise"
              contentKey="audio_title"
              defaultValue="Audio Gästebuch"
            />
          </h2>
          <EditableText
            section="preise"
            contentKey="audio_description"
            defaultValue="Persönliche Sprachnachrichten Ihrer Gäste."
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
            as="p"
          />
        </div>
        <div className="bg-muted/30 rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">
            Pakete werden über den <strong>Services-Bereich</strong> im Admin verwaltet.
          </p>
        </div>
      </Section>

      {/* Add-ons */}
      <Section variant="muted">
        <div className="max-w-3xl mb-16 md:mb-20 mx-auto text-center">
          <EditableText
            section="preise"
            contentKey="addons_subtitle"
            defaultValue="Extras"
            className="inline-block text-primary font-medium text-sm tracking-wide mb-4"
            as="span"
          />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            <EditableText
              section="preise"
              contentKey="addons_title"
              defaultValue="Zusätzliche Optionen"
            />
          </h2>
          <EditableText
            section="preise"
            contentKey="addons_description"
            defaultValue="Erweitern Sie Ihr Paket nach Ihren Wünschen."
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
            as="p"
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="bg-card p-4 rounded-xl border border-border flex justify-between items-center"
            >
              <EditableText
                section="preise"
                contentKey={`addon_${index}_name`}
                defaultValue={`Addon ${index + 1}`}
                className="text-foreground"
              />
              <EditableText
                section="preise"
                contentKey={`addon_${index}_price`}
                defaultValue="+€0"
                className="font-semibold text-primary"
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
              section="preise"
              contentKey="cta_title"
              defaultValue="Noch Fragen?"
              className="text-primary-foreground"
            />
          </h2>
          <EditableText
            section="preise"
            contentKey="cta_description"
            defaultValue="Kontaktieren Sie uns für ein individuelles Angebot oder rufen Sie uns an."
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
