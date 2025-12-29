import { Section, SectionHeader } from "@/components/ui/section";
import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "bg-secondary/30 p-8 lg:p-10 rounded-3xl transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
        ))}
      </div>

      <blockquote className="text-lg text-foreground leading-relaxed mb-8">
        &quot;{testimonial.content}&quot;
      </blockquote>

      <div>
        <p className="font-semibold text-foreground">{testimonial.name}</p>
        <p className="text-sm text-muted-foreground">
          {testimonial.role || testimonial.company}
        </p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { getContent } = useSiteContent();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const subtitle = getContent('testimonials_section', 'subtitle', 'Bewertungen');
  const title = getContent('testimonials_section', 'title', 'Was Kunden sagen');
  const description = getContent('testimonials_section', 'description', 'Wir sind stolz auf das Vertrauen unserer Kunden.');

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(3);

      if (!error && data) {
        setTestimonials(data);
      }
    };

    fetchTestimonials();
  }, []);

  // Fallback testimonials if none in database
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: '1',
      content: 'Pixelpalast hat unsere Hochzeit unvergesslich gemacht! Die Fotos waren wunderschön und das Team super professionell.',
      name: 'Maria & Thomas',
      role: 'Hochzeit',
      company: null,
      rating: 5,
    },
    {
      id: '2',
      content: 'Der 360° Video Booth war das absolute Highlight unserer Firmenfeier. Alle Gäste waren begeistert!',
      name: 'Stefan K.',
      role: 'Firmenevent',
      company: null,
      rating: 5,
    },
    {
      id: '3',
      content: 'Perfekter Service von Anfang bis Ende. Die individuellen Layouts passten perfekt zu unserem Motto.',
      name: 'Julia M.',
      role: 'Geburtstag',
      company: null,
      rating: 5,
    },
  ];

  return (
    <Section id="testimonials">
      <SectionHeader
        subtitle={subtitle}
        title={title}
        description={description}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {displayTestimonials.map((testimonial, index) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
        ))}
      </div>
    </Section>
  );
}
