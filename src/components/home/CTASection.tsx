import { Link } from "react-router-dom";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation();
  const { getContent } = useSiteContent();

  const titleLine1 = getContent('cta_section', 'title_line1', 'Bereit für unvergessliche');
  const titleLine2 = getContent('cta_section', 'title_line2', 'Erinnerungen?');
  const description = getContent('cta_section', 'description', 'Kontaktieren Sie uns noch heute und sichern Sie sich Ihren Wunschtermin.');
  const buttonText = getContent('cta_section', 'button_primary', 'Jetzt buchen');
  const phone = getContent('cta_section', 'phone', '+43 660 2545493');

  return (
    <Section className="py-24 md:py-40">
      <div
        ref={ref}
        className={cn(
          "text-center max-w-3xl mx-auto transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        )}
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
          {titleLine1}
          <br />
          <span className="text-gradient">{titleLine2}</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8 h-14 shadow-gold text-base">
            <Link to="/buchen">
              {buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-full px-8 h-14 text-base">
            <a href={`tel:${phone.replace(/\s/g, '')}`}>
              {phone}
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
}
