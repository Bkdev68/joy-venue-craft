import { Section, SectionHeader } from "@/components/ui/section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";

function BenefitCard({ title, description, index }: { title: string; description: string; index: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "group p-8 lg:p-10 rounded-3xl bg-secondary/30 transition-all duration-700 hover:bg-secondary/50",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span className="text-5xl font-semibold text-primary/20 mb-6 block">
        0{index + 1}
      </span>
      <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function BenefitsSection() {
  const { getContent } = useSiteContent();

  const subtitle = getContent('benefits_section', 'subtitle', 'Vorteile');
  const title = getContent('benefits_section', 'title', 'Das macht uns besonders');
  const description = getContent('benefits_section', 'description', 'Exzellenter Service vor, während und nach Ihrer Feier.');

  const benefits = [
    {
      title: getContent('benefits_section', 'benefit_1_title', 'Professioneller Service'),
      description: getContent('benefits_section', 'benefit_1_description', 'Unser Team kümmert sich um alles – für einen stressfreien Abend.'),
    },
    {
      title: getContent('benefits_section', 'benefit_2_title', 'Individuelle Layouts'),
      description: getContent('benefits_section', 'benefit_2_description', 'Personalisierte Designs passend zum Motto Ihres Events.'),
    },
    {
      title: getContent('benefits_section', 'benefit_3_title', 'Sofortige Übermittlung'),
      description: getContent('benefits_section', 'benefit_3_description', 'Alle Fotos und Videos am selben Abend digital verfügbar.'),
    },
    {
      title: getContent('benefits_section', 'benefit_4_title', 'Schneller Auf- und Abbau'),
      description: getContent('benefits_section', 'benefit_4_description', 'Wir kümmern uns um alles. Sie genießen Ihre Feier.'),
    },
  ];

  return (
    <Section variant="muted" id="vorteile">
      <SectionHeader
        subtitle={subtitle}
        title={title}
        description={description}
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <BenefitCard key={index} title={benefit.title} description={benefit.description} index={index} />
        ))}
      </div>
    </Section>
  );
}
