import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Wie weit im Voraus sollte ich buchen?", a: "Wir empfehlen 4-6 Wochen, für Hochzeiten 3-6 Monate Vorlaufzeit." },
  { q: "Ist die Anfahrt im Preis enthalten?", a: "Die Anfahrt wird mit €1 pro Kilometer berechnet. Wir kommen überall hin – nicht nur Wien!" },
  { q: "Wie lange dauert der Auf-/Abbau?", a: "Aufbau ca. 45-60 Min, Abbau ca. 30 Min – nicht in Buchungszeit enthalten." },
  { q: "Wann erhalte ich die Dateien?", a: "Sofortversand vor Ort, Online-Galerie in 24-48 Stunden." },
  { q: "Kann ich Pakete anpassen?", a: "Ja, kontaktieren Sie uns für individuelle Angebote." },
  { q: "Wie erfolgt die Bezahlung?", a: "30% Anzahlung bei Buchung, Rest 7 Tage vor dem Event." },
];

export default function FAQ() {
  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-subtle">
        <div className="container max-w-3xl text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">Häufige <span className="text-primary">Fragen</span></h1>
        </div>
      </section>
      <Section>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Noch Fragen?</p>
          <Button asChild><Link to="/kontakt">Kontakt aufnehmen</Link></Button>
        </div>
      </Section>
    </Layout>
  );
}
