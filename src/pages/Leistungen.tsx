import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Video, Mic, Sparkles, Users, Zap } from "lucide-react";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";
import event4 from "@/assets/gallery/event-4.jpg";

const services = [
  {
    title: "Photo Booth",
    description:
      "Unsere klassische Photo Booth liefert hochwertige Sofortfotos mit professionellem Equipment. Individuelle Layouts, direkter Druck vor Ort und digitale Kopien für Ihre Gäste.",
    image: event2,
    href: "/leistungen/photobooth",
    icon: Camera,
    features: [
      "Hochauflösende DSLR-Kamera",
      "Sofortdruck in wenigen Sekunden",
      "Individuelle Layout-Gestaltung",
      "Digitaler Download für Gäste",
      "Große Props-Auswahl inklusive",
      "Professionelle Beleuchtung",
    ],
  },
  {
    title: "360° Video Booth",
    description:
      "Spektakuläre 360-Grad-Videos, die Ihre Gäste ins Rampenlicht rücken. Perfekt für unvergessliche Momente auf Hochzeiten, Firmenevents und besonderen Anlässen.",
    image: event3,
    href: "/leistungen/360-video-booth",
    icon: Video,
    features: [
      "Beeindruckende 360°-Aufnahmen",
      "Slow-Motion-Effekte",
      "Sofortiger Versand per E-Mail/SMS",
      "Kreative Overlays & Musik",
      "Social Media optimiert",
      "Plattform mit 1m Durchmesser",
    ],
  },
  {
    title: "Audio Gästebuch",
    description:
      "Eine einzigartige Möglichkeit für Ihre Gäste, persönliche Sprachnachrichten zu hinterlassen. Die perfekte Ergänzung zu Fotos und Videos.",
    image: event4,
    href: "/leistungen/audio-gaestebuch",
    icon: Mic,
    features: [
      "Einfache Bedienung für Gäste",
      "Hochwertige Audioqualität",
      "Digitale Aufnahmen als MP3",
      "Personalisierte Aufnahmestationen",
      "Sofortige Wiedergabe möglich",
      "USB-Stick mit allen Aufnahmen",
    ],
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "Premium Qualität",
    description: "Nur hochwertige, professionelle Ausrüstung für perfekte Ergebnisse.",
  },
  {
    icon: Users,
    title: "Erfahrenes Team",
    description: "Unsere geschulten Mitarbeiter sorgen für einen reibungslosen Ablauf.",
  },
  {
    icon: Zap,
    title: "Schnelle Lieferung",
    description: "Sofortiger Druck und digitale Versendung direkt vor Ort.",
  },
];

export default function Leistungen() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4">
              Unsere Leistungen
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Unvergessliche Erlebnisse für <span className="text-primary">jeden Anlass</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Von klassischen Photo Booths bis hin zu modernen 360°-Video-Erlebnissen – 
              wir bieten maßgeschneiderte Lösungen für Ihre Veranstaltung.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <div className="space-y-24">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    {service.title}
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="shadow-gold">
                  <Link to={service.href}>
                    Mehr erfahren
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Benefits */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Warum Pixelpalast"
          title="Ihre Vorteile auf einen Blick"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-card p-8 rounded-2xl border border-border text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Bereit für unvergessliche Momente?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Kontaktieren Sie uns noch heute und lassen Sie uns gemeinsam Ihre Veranstaltung planen.
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
