import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Video, Zap, Share2, Music, Sparkles, Clock } from "lucide-react";
import event3 from "@/assets/gallery/event-3.jpg";
import event4 from "@/assets/gallery/event-4.jpg";

const features = [
  {
    icon: Video,
    title: "360° Rundum-Aufnahmen",
    description: "Beeindruckende Videos aus allen Perspektiven auf unserer 1m-Plattform.",
  },
  {
    icon: Zap,
    title: "Slow-Motion-Effekte",
    description: "Dramatische Zeitlupen-Aufnahmen für einzigartige Momente.",
  },
  {
    icon: Music,
    title: "Kreative Overlays & Musik",
    description: "Individuelle Grafiken und Soundtracks passend zu Ihrem Event.",
  },
  {
    icon: Share2,
    title: "Sofortiger Versand",
    description: "Videos direkt per E-Mail oder SMS an Ihre Gäste.",
  },
  {
    icon: Sparkles,
    title: "Professionelle Beleuchtung",
    description: "Ringlichter und LED-Panels für perfekte Ausleuchtung.",
  },
  {
    icon: Clock,
    title: "Schnelle Bearbeitung",
    description: "Fertige Videos in weniger als einer Minute verfügbar.",
  },
];

const packages = [
  {
    name: "Starter",
    duration: "2 Stunden",
    price: "Ab €490",
    features: ["360° Videos", "Sofortversand", "Basis-Overlay", "1 Mitarbeiter"],
  },
  {
    name: "Classic",
    duration: "4 Stunden",
    price: "Ab €790",
    features: ["Alle Starter-Leistungen", "Custom Overlay", "Slow Motion", "Musik-Auswahl"],
    popular: true,
  },
  {
    name: "Premium",
    duration: "6 Stunden",
    price: "Ab €1090",
    features: ["Alle Classic-Leistungen", "2 Mitarbeiter", "Props inklusive", "USB mit allen Videos"],
  },
];

export default function VideoBooth360() {
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
                360° Video <span className="text-primary">Booth</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Spektakuläre 360-Grad-Videos, die Ihre Gäste ins Rampenlicht rücken. 
                Perfekt für Hochzeiten, Firmenfeiern und besondere Anlässe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="shadow-gold">
                  <Link to="/buchen">
                    Jetzt buchen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/preise">Preise ansehen</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={event3}
                  alt="360° Video Booth"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">360° Rotation</p>
                    <p className="text-sm text-muted-foreground">in 15 Sekunden</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <Section variant="muted">
        <SectionHeader
          subtitle="So funktioniert's"
          title="360° Magie in 3 Schritten"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Aufstellen", desc: "Ihre Gäste positionieren sich auf der Plattform" },
            { step: "02", title: "Aufnahme", desc: "Die Kamera dreht sich und nimmt das Video auf" },
            { step: "03", title: "Teilen", desc: "Das fertige Video wird sofort per E-Mail versendet" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-display text-2xl font-bold">
                {item.step}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section>
        <SectionHeader
          subtitle="Features"
          title="Was unsere 360° Booth bietet"
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

      {/* Packages */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Pakete"
          title="Wählen Sie Ihr Paket"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
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
              <p className="font-display text-3xl font-bold text-primary mb-6">
                {pkg.price}
              </p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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

      {/* CTA */}
      <Section>
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Bereit für 360° Magie?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Buchen Sie jetzt unsere 360° Video Booth und begeistern Sie Ihre Gäste.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/buchen">Jetzt Termin buchen</Link>
          </Button>
        </div>
      </Section>
    </Layout>
  );
}
