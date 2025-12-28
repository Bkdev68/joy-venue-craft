import { Section, SectionHeader } from "@/components/ui/section";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Pixelpalast hat unsere Hochzeit unvergesslich gemacht! Die Fotos waren wunderschön und das Team super professionell.",
    author: "Maria & Thomas",
    event: "Hochzeit",
    rating: 5,
  },
  {
    quote:
      "Der 360° Video Booth war das absolute Highlight unserer Firmenfeier. Alle Gäste waren begeistert!",
    author: "Stefan K.",
    event: "Firmenevent",
    rating: 5,
  },
  {
    quote:
      "Perfekter Service von Anfang bis Ende. Die individuellen Layouts passten perfekt zu unserem Motto. Sehr empfehlenswert!",
    author: "Julia M.",
    event: "Geburtstag",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <Section id="testimonials">
      <SectionHeader
        subtitle="Kundenstimmen"
        title="Was unsere Kunden sagen"
        description="Wir sind stolz auf das Vertrauen unserer Kunden und die positiven Rückmeldungen, die wir erhalten."
      />

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-card p-6 lg:p-8 rounded-2xl border border-border relative"
          >
            {/* Quote mark */}
            <div className="absolute top-4 right-6 text-6xl text-primary/10 font-display leading-none">
              "
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-primary text-primary"
                />
              ))}
            </div>

            <blockquote className="text-foreground leading-relaxed mb-6 relative z-10">
              "{testimonial.quote}"
            </blockquote>

            <div>
              <p className="font-semibold text-foreground">
                {testimonial.author}
              </p>
              <p className="text-sm text-muted-foreground">{testimonial.event}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
