import { Section, SectionHeader } from "@/components/ui/section";
import { Users, Palette, Send, Clock, Award } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Professioneller Vorort-Service",
    description:
      "Unser Team kümmert sich um jegliche Art von Eventualitäten, um Ihnen einen stressfreien Abend zu garantieren.",
  },
  {
    icon: Palette,
    title: "Individuelle Layouts",
    description:
      "Unser Designer-Team stellt Ihnen passend zum Motto des Events mehrere personalisierte Layouts zur Verfügung.",
  },
  {
    icon: Send,
    title: "Sofortige Dateiübermittlung",
    description:
      "Alle Fotos und Videos werden am selben Abend digital bereitgestellt – als Sofortdruck oder per Cloud-Link.",
  },
  {
    icon: Clock,
    title: "Schneller Auf- und Abbau",
    description:
      "Wir kümmern uns um alles – von der Anlieferung bis zum Abbau. Sie genießen einfach Ihre Feier.",
  },
  {
    icon: Award,
    title: "Individuelle Preisgestaltungen",
    description:
      "Flexible Pakete, die sich Ihrem Budget und Ihren Wünschen anpassen. Keine versteckten Kosten.",
  },
];

export function BenefitsSection() {
  return (
    <Section id="vorteile">
      <SectionHeader
        subtitle="Warum Pixelpalast"
        title="Das macht uns besonders"
        description="Unser professionelles Team konzentriert sich auf exzellenten Service, um Ihnen vor, nach und während Ihrer Feier einen reibungslosen Ablauf zu garantieren."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className="group p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <benefit.icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              {benefit.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
