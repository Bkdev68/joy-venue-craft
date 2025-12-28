import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";

export default function Impressum() {
  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-subtle">
        <div className="container max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-foreground">Impressum</h1>
        </div>
      </section>
      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h2>Angaben gemäß § 5 ECG</h2>
          <p><strong>Pixelpalast</strong><br />Wien, Österreich</p>
          <h3>Kontakt</h3>
          <p>Telefon: +43 660 2545493<br />E-Mail: office@pixelpalast.at</p>
          <h3>Haftungsausschluss</h3>
          <p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
        </div>
      </Section>
    </Layout>
  );
}
