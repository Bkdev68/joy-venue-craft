import { Link } from "react-router-dom";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";

const services = [
  {
    title: "Photo Booth",
    description:
      "Hochwertige Sofortfotos mit professionellem Equipment. Individuelle Layouts und direkter Druck vor Ort.",
    image: event2,
    href: "/leistungen/photobooth",
  },
  {
    title: "360° Video Booth",
    description:
      "Spektakuläre 360-Grad-Videos, die Ihre Gäste ins Rampenlicht rücken. Perfekt für unvergessliche Momente.",
    image: event3,
    href: "/leistungen/360-video-booth",
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "group relative transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Image */}
      <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-8">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3 tracking-tight">
        {service.title}
      </h3>
      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
        {service.description}
      </p>

      <Link 
        to={service.href}
        className="inline-flex items-center text-primary font-medium hover:gap-3 transition-all duration-300 gap-2"
      >
        Mehr erfahren
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function ServicesSection() {
  return (
    <Section id="leistungen">
      <SectionHeader
        subtitle="Services"
        title="Was wir bieten"
        description="Eine perfekt auf Sie zugeschnittene Auswahl an Photobooth und 360° Video Services."
      />

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {services.map((service, index) => (
          <ServiceCard key={service.title} service={service} index={index} />
        ))}
      </div>

      <div className="text-center mt-16">
        <Button asChild size="lg" className="rounded-full px-8 h-14 shadow-gold">
          <Link to="/leistungen">
            Alle Leistungen
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
