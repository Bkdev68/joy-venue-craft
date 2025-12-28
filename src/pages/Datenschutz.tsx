import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-subtle">
        <div className="container max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-foreground">Datenschutz</h1>
        </div>
      </section>
      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h2>Datenschutzerklärung</h2>
          <p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen.</p>
          <h3>Verantwortlicher</h3>
          <p>Pixelpalast, Wien, Österreich<br />E-Mail: office@pixelpalast.at</p>
          <h3>Erhobene Daten</h3>
          <p>Bei Kontaktanfragen speichern wir Ihre Angaben zur Bearbeitung. Fotos werden nur mit Einwilligung veröffentlicht.</p>
          <h3>Ihre Rechte</h3>
          <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch. Kontaktieren Sie uns jederzeit.</p>
        </div>
      </Section>
    </Layout>
  );
}
