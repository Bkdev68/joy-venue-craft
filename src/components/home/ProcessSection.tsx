import { Section, SectionHeader } from "@/components/ui/section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";

function StepCard({ number, title, description, index }: { number: string; title: string; description: string; index: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "text-center transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <span className="text-2xl font-semibold text-primary">
          {number}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}

export function ProcessSection() {
  const { getContent } = useSiteContent();

  const subtitle = getContent('process_section', 'subtitle', 'Ablauf');
  const title = getContent('process_section', 'title', 'In 4 Schritten zum Event');
  const description = getContent('process_section', 'description', 'Von der Anfrage bis zum fertigen Ergebnis – einfach und unkompliziert.');

  const steps = [
    {
      number: '01',
      title: getContent('process_section', 'step_1_title', 'Anfrage senden'),
      description: getContent('process_section', 'step_1_description', 'Kontaktieren Sie uns mit den Details Ihrer Veranstaltung.'),
    },
    {
      number: '02',
      title: getContent('process_section', 'step_2_title', 'Termin bestätigen'),
      description: getContent('process_section', 'step_2_description', 'Wir prüfen die Verfügbarkeit und senden Ihr Angebot.'),
    },
    {
      number: '03',
      title: getContent('process_section', 'step_3_title', 'Design abstimmen'),
      description: getContent('process_section', 'step_3_description', 'Individuelle Layouts passend zum Motto Ihres Events.'),
    },
    {
      number: '04',
      title: getContent('process_section', 'step_4_title', 'Event genießen'),
      description: getContent('process_section', 'step_4_description', 'Wir kümmern uns um alles. Sie genießen den Abend!'),
    },
  ];

  return (
    <Section id="ablauf">
      <SectionHeader
        subtitle={subtitle}
        title={title}
        description={description}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {steps.map((step, index) => (
          <StepCard key={step.number} number={step.number} title={step.title} description={step.description} index={index} />
        ))}
      </div>
    </Section>
  );
}
