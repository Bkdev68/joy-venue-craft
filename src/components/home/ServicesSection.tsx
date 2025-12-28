import { Link } from "react-router-dom";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";

const services = [
  {
    title: "Photo Booth",
    description:
      "Hochwertige Sofortfotos mit professionellem Equipment. Individuelle Layouts und direkter Druck vor Ort.",
    image: event2,
    href: "/leistungen/photobooth",
    features: ["Sofortdruck", "Individuelle Layouts", "Props inklusive"],
  },
  {
    title: "360° Video Booth",
    description:
      "Spektakuläre 360-Grad-Videos, die Ihre Gäste ins Rampenlicht rücken. Perfekt für unvergessliche Momente.",
    image: event3,
    href: "/leistungen/360-video-booth",
    features: ["Slow Motion", "Sofortiger Versand", "Kreative Overlays"],
  },
];

export function ServicesSection() {
  return (
    <Section variant="muted" id="leistungen">
      <SectionHeader
        subtitle="Unsere Leistungen"
        title="Was wir Ihnen bieten"
        description="Eine individuell und auf Sie perfekt zugeschnittene Auswahl an verschiedensten Angeboten, die sowohl Fotoboxen als auch 360-Grad-Videospinner umfassen."
      />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {services.map((service, index) => (
          <div
            key={service.title}
            className="group relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-border"
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {service.description}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <Button asChild variant="outline" className="group/btn">
                <Link to={service.href}>
                  Mehr erfahren
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button asChild size="lg" className="shadow-gold">
          <Link to="/leistungen">
            Alle Leistungen ansehen
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
