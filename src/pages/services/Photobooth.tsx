import { Layout } from "@/components/layout/Layout";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Printer, Download, Palette, Users, Clock } from "lucide-react";
import event2 from "@/assets/gallery/event-2.jpg";
import event1 from "@/assets/gallery/event-1.jpg";

const features = [
  {
    icon: Camera,
    title: "Hochauflösende Fotos",
    description: "Professionelle DSLR-Kamera für gestochen scharfe Bilder in bester Qualität.",
  },
  {
    icon: Printer,
    title: "Sofortdruck",
    description: "Hochwertige Ausdrucke in wenigen Sekunden direkt vor Ort für Ihre Gäste.",
  },
  {
    icon: Palette,
    title: "Individuelle Layouts",
    description: "Personalisierte Foto-Layouts passend zu Ihrem Event-Thema und Corporate Design.",
  },
  {
    icon: Download,
    title: "Digitaler Download",
    description: "Alle Fotos auch digital verfügbar per QR-Code oder Online-Galerie.",
  },
  {
    icon: Users,
    title: "Props inklusive",
    description: "Große Auswahl an lustigen Requisiten und Accessoires für maximalen Spaß.",
  },
  {
    icon: Clock,
    title: "Unbegrenzte Aufnahmen",
    description: "So viele Fotos wie gewünscht während der gebuchten Zeit.",
  },
];

const packages = [
  {
    name: "Starter",
    duration: "2 Stunden",
    price: "Ab €390",
    features: ["Sofortdruck", "Digitale Galerie", "Props-Auswahl", "1 Mitarbeiter"],
  },
  {
    name: "Classic",
    duration: "4 Stunden",
    price: "Ab €590",
    features: ["Alle Starter-Leistungen", "Individuelles Layout", "Mehr Props", "Gästebuch"],
    popular: true,
  },
  {
    name: "Premium",
    duration: "6 Stunden",
    price: "Ab €790",
    features: ["Alle Classic-Leistungen", "2 Mitarbeiter", "Video-Messages", "USB-Stick"],
  },
];

export default function Photobooth() {
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
                Photo <span className="text-primary">Booth</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Die klassische Photo Booth für hochwertige Sofortfotos. Professionelles Equipment, 
                individuelle Layouts und direkter Druck vor Ort – perfekt für jede Veranstaltung.
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
                  src={event2}
                  alt="Photo Booth Setup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Features"
          title="Was unsere Photo Booth bietet"
          description="Modernste Technik kombiniert mit elegantem Design für perfekte Ergebnisse."
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
      <Section>
        <SectionHeader
          subtitle="Pakete"
          title="Wählen Sie Ihr Paket"
          description="Flexible Optionen für jedes Event und Budget."
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

      {/* Gallery */}
      <Section variant="muted">
        <SectionHeader
          subtitle="Galerie"
          title="Eindrücke unserer Photo Booth"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[event1, event2, event1, event2, event1, event2].map((img, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden">
              <img src={img} alt={`Photo Booth Beispiel ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link to="/galerie">Alle Fotos ansehen</Link>
          </Button>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="bg-primary rounded-3xl p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Bereit für Ihre Photo Booth?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Sichern Sie sich jetzt Ihren Wunschtermin und machen Sie Ihr Event unvergesslich.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/buchen">Jetzt Termin buchen</Link>
          </Button>
        </div>
      </Section>
    </Layout>
  );
}
