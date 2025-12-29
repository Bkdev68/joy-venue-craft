import { Section, SectionHeader } from "@/components/ui/section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const benefits = [
  {
    title: "Professioneller Service",
    description:
      "Unser Team kümmert sich um alles – für einen stressfreien Abend.",
  },
  {
    title: "Individuelle Layouts",
    description:
      "Personalisierte Designs passend zum Motto Ihres Events.",
  },
  {
    title: "Sofortige Übermittlung",
    description:
      "Alle Fotos und Videos am selben Abend digital verfügbar.",
  },
  {
    title: "Schneller Auf- und Abbau",
    description:
      "Wir kümmern uns um alles. Sie genießen Ihre Feier.",
  },
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
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
        {benefit.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {benefit.description}
      </p>
    </div>
  );
}

export function BenefitsSection() {
  return (
    <Section variant="muted" id="vorteile">
      <SectionHeader
        subtitle="Vorteile"
        title="Das macht uns besonders"
        description="Exzellenter Service vor, während und nach Ihrer Feier."
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <BenefitCard key={benefit.title} benefit={benefit} index={index} />
        ))}
      </div>
    </Section>
  );
}
