import { Link } from "react-router-dom";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";

interface Service {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  image_url: string | null;
}

const fallbackServices = [
  {
    id: '1',
    slug: 'photobooth',
    title: "Photo Booth",
    short_description: "Hochwertige Sofortfotos mit professionellem Equipment. Individuelle Layouts und direkter Druck vor Ort.",
    image_url: event2,
  },
  {
    id: '2',
    slug: '360-video-booth',
    title: "360° Video Booth",
    short_description: "Spektakuläre 360-Grad-Videos, die Ihre Gäste ins Rampenlicht rücken. Perfekt für unvergessliche Momente.",
    image_url: event3,
  },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
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
          src={service.image_url || event2}
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
        {service.short_description}
      </p>

      <Link 
        to={`/leistungen/${service.slug}`}
        className="inline-flex items-center text-primary font-medium hover:gap-3 transition-all duration-300 gap-2"
      >
        Mehr erfahren
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function ServicesSection() {
  const { getContent } = useSiteContent();
  const [services, setServices] = useState<Service[]>([]);

  const subtitle = getContent('services_section', 'subtitle', 'Services');
  const title = getContent('services_section', 'title', 'Was wir bieten');
  const description = getContent('services_section', 'description', 'Eine perfekt auf Sie zugeschnittene Auswahl an Photobooth und 360° Video Services.');
  const buttonText = getContent('services_section', 'button_text', 'Alle Leistungen');

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(2);

      if (!error && data && data.length > 0) {
        setServices(data);
      }
    };

    fetchServices();
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <Section id="leistungen">
      <SectionHeader
        subtitle={subtitle}
        title={title}
        description={description}
      />

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {displayServices.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>

      <div className="text-center mt-16">
        <Button asChild size="lg" className="rounded-full px-8 h-14 shadow-gold">
          <Link to="/leistungen">
            {buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
