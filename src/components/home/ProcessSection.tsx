import { Section, SectionHeader } from "@/components/ui/section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Anfrage senden",
    description: "Kontaktieren Sie uns mit den Details Ihrer Veranstaltung.",
  },
  {
    number: "02",
    title: "Termin bestätigen",
    description: "Wir prüfen die Verfügbarkeit und senden Ihr Angebot.",
  },
  {
    number: "03",
    title: "Design abstimmen",
    description: "Individuelle Layouts passend zum Motto Ihres Events.",
  },
  {
    number: "04",
    title: "Event genießen",
    description: "Wir kümmern uns um alles. Sie genießen den Abend!",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
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
          {step.number}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
        {step.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
        {step.description}
      </p>
    </div>
  );
}

export function ProcessSection() {
  return (
    <Section id="ablauf">
      <SectionHeader
        subtitle="Ablauf"
        title="In 4 Schritten zum Event"
        description="Von der Anfrage bis zum fertigen Ergebnis – einfach und unkompliziert."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {steps.map((step, index) => (
          <StepCard key={step.number} step={step} index={index} />
        ))}
      </div>
    </Section>
  );
}
