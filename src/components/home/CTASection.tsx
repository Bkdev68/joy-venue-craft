import { Link } from "react-router-dom";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone } from "lucide-react";

export function CTASection() {
  return (
    <Section className="py-20 md:py-32">
      <div className="relative rounded-3xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-gold" />
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 py-16 md:py-24 px-8 md:px-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            Bereit für unvergessliche Erinnerungen?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kontaktieren Sie uns noch heute und sichern Sie sich Ihren Wunschtermin. 
            Wir freuen uns darauf, Ihre Veranstaltung besonders zu machen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-base shadow-lg"
            >
              <Link to="/buchen">
                <Calendar className="mr-2 h-5 w-5" />
                Jetzt Termin buchen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="tel:+436602545493">
                <Phone className="mr-2 h-5 w-5" />
                +43 660 2545493
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
