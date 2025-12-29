import { Section, SectionHeader } from "@/components/ui/section";
import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Pixelpalast hat unsere Hochzeit unvergesslich gemacht! Die Fotos waren wunderschön und das Team super professionell.",
    author: "Maria & Thomas",
    event: "Hochzeit",
  },
  {
    quote:
      "Der 360° Video Booth war das absolute Highlight unserer Firmenfeier. Alle Gäste waren begeistert!",
    author: "Stefan K.",
    event: "Firmenevent",
  },
  {
    quote:
      "Perfekter Service von Anfang bis Ende. Die individuellen Layouts passten perfekt zu unserem Motto.",
    author: "Julia M.",
    event: "Geburtstag",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
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
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
        ))}
      </div>

      <blockquote className="text-lg text-foreground leading-relaxed mb-8">
        "{testimonial.quote}"
      </blockquote>

      <div>
        <p className="font-semibold text-foreground">{testimonial.author}</p>
        <p className="text-sm text-muted-foreground">{testimonial.event}</p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <Section id="testimonials">
      <SectionHeader
        subtitle="Bewertungen"
        title="Was Kunden sagen"
        description="Wir sind stolz auf das Vertrauen unserer Kunden."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} index={index} />
        ))}
      </div>
    </Section>
  );
}
