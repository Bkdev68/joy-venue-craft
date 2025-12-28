import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Mic, Play, Download, Heart, Volume2, Usb } from "lucide-react";
import event4 from "@/assets/gallery/event-4.jpg";

const features = [
  {
    icon: Mic,
    title: "Einfache Aufnahme",
    description: "Intuitive Bedienung – Gäste sprechen einfach ihre Nachricht ein.",
  },
  {
    icon: Volume2,
    title: "Hochwertige Qualität",
    description: "Kristallklare Audioaufnahmen in professioneller Studioqualität.",
  },
  {
    icon: Play,
    title: "Sofortige Wiedergabe",
    description: "Nachrichten können direkt vor Ort angehört werden.",
  },
  {
    icon: Download,
    title: "Digitale Kopien",
    description: "Alle Aufnahmen als MP3-Dateien für die Ewigkeit.",
  },
  {
    icon: Heart,
    title: "Persönliche Nachrichten",
    description: "Emotionale Glückwünsche und Erinnerungen von Ihren Liebsten.",
  },
  {
    icon: Usb,
    title: "USB-Stick inklusive",
    description: "Alle Aufnahmen auf einem schönen USB-Stick als Andenken.",
  },
];

export default function AudioGuestbook() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Link
                to="/leistungen"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
              >
                ← Zurück zu Leistungen
              </Link>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Audio <span className="text-primary">Gästebuch</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Eine einzigartige Möglichkeit für Ihre Gäste, persönliche Sprachnachrichten 
                zu hinterlassen. Die perfekte Ergänzung zu Fotos und Videos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="shadow-gold">
                  <Link to="/buchen">
                    Jetzt buchen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/kontakt">Anfrage senden</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={event4}
                  alt="Audio Gästebuch"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Unbegrenzt</p>
                    <p className="text-sm text-muted-foreground">Nachrichten</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Features"
          title="Das Audio Gästebuch im Detail"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section>
        <SectionHeader
          subtitle="Preise"
          title="Einfache Preisgestaltung"
        />
        <div className="max-w-lg mx-auto">
          <div className="bg-card p-8 rounded-2xl border border-primary shadow-gold">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Audio Gästebuch
            </h3>
            <p className="text-muted-foreground mb-4">Komplettes Paket</p>
            <p className="font-display text-4xl font-bold text-primary mb-6">
              Ab €290
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Elegante Aufnahmestation",
                "Unbegrenzte Nachrichten",
                "Professionelles Mikrofon",
                "Sofortige Wiedergabe",
                "Alle Aufnahmen als MP3",
                "USB-Stick mit Gravur",
                "Auf- und Abbau inklusive",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" size="lg">
              <Link to="/buchen">Jetzt buchen</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Ideal for */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Perfekt für"
          title="Ideale Anlässe"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Hochzeiten", "Geburtstage", "Jubiläen", "Abschiede"].map((occasion) => (
            <div
              key={occasion}
              className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-shadow"
            >
              <p className="font-display text-lg font-bold text-foreground">{occasion}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Unvergessliche Stimmen festhalten
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Lassen Sie die Stimmen Ihrer Liebsten für immer erklingen.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/buchen">Jetzt anfragen</Link>
          </Button>
        </div>
      </Section>
    </Layout>
  );
}
