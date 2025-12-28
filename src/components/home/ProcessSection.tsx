import { Section, SectionHeader } from "@/components/ui/section";
import { MessageSquare, Calendar, Palette, PartyPopper } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Anfrage senden",
    description:
      "Kontaktieren Sie uns mit den Details Ihrer Veranstaltung – Datum, Ort und gewünschte Leistung.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Termin bestätigen",
    description:
      "Wir prüfen die Verfügbarkeit und bestätigen Ihren Wunschtermin. Sie erhalten ein individuelles Angebot.",
  },
  {
    number: "03",
    icon: Palette,
    title: "Design abstimmen",
    description:
      "Unser Designer-Team erstellt individuelle Layouts passend zum Motto Ihres Events.",
  },
  {
    number: "04",
    icon: PartyPopper,
    title: "Event genießen",
    description:
      "Wir kümmern uns um alles vor Ort. Sie und Ihre Gäste genießen einfach den Abend!",
  },
];

export function ProcessSection() {
  return (
    <Section variant="cream" id="ablauf">
      <SectionHeader
        subtitle="So funktioniert's"
        title="In 4 einfachen Schritten zum unvergesslichen Event"
        description="Von der ersten Anfrage bis zum fertigen Ergebnis – wir machen es Ihnen so einfach wie möglich."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px bg-border" />
            )}

            <div className="text-center">
              {/* Number badge */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5 relative">
                <span className="font-display text-2xl font-bold text-primary">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
