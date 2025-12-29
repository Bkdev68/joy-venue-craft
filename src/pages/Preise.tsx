import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const photoboothPackages = [
  {
    name: "Starter",
    duration: "2 Stunden",
    price: "390",
    features: [
      "Hochauflösende Fotos",
      "Sofortdruck vor Ort",
      "Digitale Galerie",
      "Basis-Props",
      "1 Mitarbeiter",
      "Auf-/Abbau inklusive",
    ],
  },
  {
    name: "Classic",
    duration: "4 Stunden",
    price: "590",
    popular: true,
    features: [
      "Alle Starter-Leistungen",
      "Individuelles Layout",
      "Erweiterte Props-Auswahl",
      "Gästebuch-Album",
      "Social Media Sharing",
      "Grüner/weißer Hintergrund",
    ],
  },
  {
    name: "Premium",
    duration: "6 Stunden",
    price: "790",
    features: [
      "Alle Classic-Leistungen",
      "2 Mitarbeiter",
      "Video-Messages",
      "USB-Stick mit allen Fotos",
      "Hochwertige Props",
      "Greenscreen-Option",
    ],
  },
];

const videoBooth360Packages = [
  {
    name: "Starter",
    duration: "2 Stunden",
    price: "490",
    features: [
      "360° Video-Aufnahmen",
      "Sofortversand per E-Mail",
      "Basis-Overlay",
      "1 Mitarbeiter",
      "Auf-/Abbau inklusive",
    ],
  },
  {
    name: "Classic",
    duration: "4 Stunden",
    price: "790",
    popular: true,
    features: [
      "Alle Starter-Leistungen",
      "Custom Overlay mit Ihrem Branding",
      "Slow-Motion-Effekte",
      "Musik-Auswahl",
      "Social Media optimiert",
    ],
  },
  {
    name: "Premium",
    duration: "6 Stunden",
    price: "1090",
    features: [
      "Alle Classic-Leistungen",
      "2 Mitarbeiter",
      "Props inklusive",
      "USB mit allen Videos",
      "Individuelles Intro/Outro",
    ],
  },
];

const addons = [
  { name: "Zusätzliche Stunde", price: "+€90/h" },
  { name: "Gästebuch-Album", price: "+€49" },
  { name: "USB-Stick mit allen Dateien", price: "+€39" },
  { name: "Greenscreen-Hintergrund", price: "+€79" },
  { name: "Zusätzlicher Mitarbeiter", price: "+€79/h" },
  { name: "Anfahrt", price: "€1/km" },
];

const faqs = [
  {
    question: "Wie weit im Voraus sollte ich buchen?",
    answer:
      "Wir empfehlen, mindestens 4-6 Wochen vor Ihrem Event zu buchen. Für Hochzeiten und große Events empfehlen wir sogar 3-6 Monate Vorlaufzeit, besonders in der Hochsaison (Mai-September).",
  },
  {
    question: "Ist die Anfahrt im Preis enthalten?",
    answer:
      "Die Anfahrt wird mit €1 pro Kilometer berechnet. Wir kommen überall hin – nicht nur Wien und Umgebung!",
  },
  {
    question: "Kann ich die Pakete individuell anpassen?",
    answer:
      "Ja, natürlich! Alle Pakete können nach Ihren Wünschen angepasst werden. Kontaktieren Sie uns einfach für ein individuelles Angebot.",
  },
  {
    question: "Wie lange dauert der Auf- und Abbau?",
    answer:
      "Der Aufbau dauert etwa 45-60 Minuten, der Abbau etwa 30 Minuten. Diese Zeiten sind nicht in der Buchungszeit enthalten.",
  },
  {
    question: "Wann erhalte ich die digitalen Dateien?",
    answer:
      "Fotos und Videos werden direkt vor Ort digital versendet. Die vollständige Online-Galerie ist in der Regel innerhalb von 24-48 Stunden verfügbar.",
  },
  {
    question: "Wie erfolgt die Bezahlung?",
    answer:
      "Wir verlangen eine Anzahlung von 30% bei Buchungsbestätigung. Der Restbetrag ist spätestens 7 Tage vor dem Event fällig.",
  },
];

export default function Preise() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4">
              Preise & Pakete
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Transparente <span className="text-primary">Preise</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wählen Sie das passende Paket für Ihr Event. Alle Preise verstehen 
              sich inklusive Auf- und Abbau sowie einem erfahrenen Mitarbeiter.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Booth Packages */}
      <Section>
        <SectionHeader
          subtitle="Photo Booth"
          title="Photo Booth Pakete"
          description="Klassische Fotobox mit Sofortdruck und digitaler Galerie."
        />
        <div className="grid md:grid-cols-3 gap-8">
          {photoboothPackages.map((pkg) => (
            <div
              key={pkg.name}
              className={`bg-card p-8 rounded-2xl border ${
                pkg.popular ? "border-primary shadow-gold" : "border-border"
              } relative`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Beliebt
                </span>
              )}
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {pkg.name}
              </h3>
              <p className="text-muted-foreground mb-4">{pkg.duration}</p>
              <p className="font-display text-4xl font-bold text-primary mb-1">
                €{pkg.price}
              </p>
              <p className="text-sm text-muted-foreground mb-6">einmalig</p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-foreground text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full" variant={pkg.popular ? "default" : "outline"}>
                <Link to="/buchen">Jetzt buchen</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* 360° Video Booth Packages */}
      <Section variant="muted">
        <SectionHeader
          subtitle="360° Video Booth"
          title="360° Video Booth Pakete"
          description="Spektakuläre 360-Grad-Videos mit Slow-Motion-Effekten."
        />
        <div className="grid md:grid-cols-3 gap-8">
          {videoBooth360Packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`bg-card p-8 rounded-2xl border ${
                pkg.popular ? "border-primary shadow-gold" : "border-border"
              } relative`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Beliebt
                </span>
              )}
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {pkg.name}
              </h3>
              <p className="text-muted-foreground mb-4">{pkg.duration}</p>
              <p className="font-display text-4xl font-bold text-primary mb-1">
                €{pkg.price}
              </p>
              <p className="text-sm text-muted-foreground mb-6">einmalig</p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-foreground text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full" variant={pkg.popular ? "default" : "outline"}>
                <Link to="/buchen">Jetzt buchen</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Audio Guestbook */}
      <Section>
        <SectionHeader
          subtitle="Audio Gästebuch"
          title="Audio Gästebuch"
          description="Persönliche Sprachnachrichten Ihrer Gäste."
        />
        <div className="max-w-lg mx-auto">
          <div className="bg-card p-8 rounded-2xl border border-primary shadow-gold">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Komplett-Paket
            </h3>
            <p className="text-muted-foreground mb-4">Ganzer Tag</p>
            <p className="font-display text-4xl font-bold text-primary mb-1">€290</p>
            <p className="text-sm text-muted-foreground mb-6">einmalig</p>
            <ul className="space-y-3 mb-8">
              {[
                "Elegante Aufnahmestation",
                "Unbegrenzte Nachrichten",
                "Professionelles Mikrofon",
                "Sofortige Wiedergabe",
                "Alle Aufnahmen als MP3",
                "USB-Stick inklusive",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-foreground text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full">
              <Link to="/buchen">Jetzt buchen</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Add-ons */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Extras"
          title="Zusätzliche Optionen"
          description="Erweitern Sie Ihr Paket nach Ihren Wünschen."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {addons.map((addon) => (
            <div
              key={addon.name}
              className="bg-card p-4 rounded-xl border border-border flex justify-between items-center"
            >
              <span className="text-foreground">{addon.name}</span>
              <span className="font-semibold text-primary">{addon.price}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHeader
          subtitle="FAQ"
          title="Häufige Fragen"
          description="Antworten auf die wichtigsten Fragen rund um Buchung und Preise."
        />
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="muted">
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Noch Fragen?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Kontaktieren Sie uns für ein individuelles Angebot oder rufen Sie uns an.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/buchen">Jetzt buchen</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/kontakt">Kontakt aufnehmen</Link>
            </Button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
