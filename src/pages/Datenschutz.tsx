import { Layout } from "@/components/layout/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="pt-32 pb-24">
        <div className="container max-w-3xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight mb-12">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Einleitung und Überblick</h2>
              <p>
                Wir haben diese Datenschutzerklärung (Fassung 05.01.2025-112926850) verfasst, um Ihnen gemäß der Vorgaben der{" "}
                <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Datenschutz-Grundverordnung (EU) 2016/679
                </a>{" "}
                und anwendbaren nationalen Gesetzen zu erklären, welche personenbezogenen Daten (kurz Daten) wir als Verantwortliche – und die von uns beauftragten Auftragsverarbeiter (z. B. Provider) – verarbeiten, zukünftig verarbeiten werden und welche rechtmäßigen Möglichkeiten Sie haben.
              </p>
              <p>
                <strong className="text-foreground">Kurz gesagt:</strong> Wir informieren Sie umfassend über Daten, die wir über Sie verarbeiten.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Anwendungsbereich</h2>
              <p>
                Diese Datenschutzerklärung gilt für alle von uns im Unternehmen verarbeiteten personenbezogenen Daten und für alle personenbezogenen Daten, die von uns beauftragte Firmen (Auftragsverarbeiter) verarbeiten. Der Anwendungsbereich umfasst:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>alle Onlineauftritte (Websites, Onlineshops), die wir betreiben</li>
                <li>Social Media Auftritte und E-Mail-Kommunikation</li>
                <li>mobile Apps für Smartphones und andere Geräte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Rechtsgrundlagen</h2>
              <p>Wir verarbeiten Ihre Daten nur, wenn mindestens eine der folgenden Bedingungen zutrifft:</p>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong className="text-foreground">Einwilligung</strong> (Artikel 6 Absatz 1 lit. a DSGVO): Sie haben uns Ihre Einwilligung gegeben, Daten zu einem bestimmten Zweck zu verarbeiten.
                </li>
                <li>
                  <strong className="text-foreground">Vertrag</strong> (Artikel 6 Absatz 1 lit. b DSGVO): Um einen Vertrag oder vorvertragliche Verpflichtungen mit Ihnen zu erfüllen, verarbeiten wir Ihre Daten.
                </li>
                <li>
                  <strong className="text-foreground">Rechtliche Verpflichtung</strong> (Artikel 6 Absatz 1 lit. c DSGVO): Wenn wir einer rechtlichen Verpflichtung unterliegen, verarbeiten wir Ihre Daten.
                </li>
                <li>
                  <strong className="text-foreground">Berechtigte Interessen</strong> (Artikel 6 Absatz 1 lit. f DSGVO): Im Falle berechtigter Interessen, die Ihre Grundrechte nicht einschränken, behalten wir uns die Verarbeitung personenbezogener Daten vor.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Kontaktdaten des Verantwortlichen</h2>
              <p>Sollten Sie Fragen zum Datenschutz haben, finden Sie nachfolgend die Kontaktdaten des Verantwortlichen:</p>
              <div className="bg-secondary/30 p-6 rounded-2xl mt-4 space-y-1 not-prose">
                <p className="text-foreground font-semibold">Pixelpalast</p>
                <p>Marcel Fischer</p>
                <p>Wildstraße 5</p>
                <p>2100 Korneuburg, Österreich</p>
                <p className="pt-2">
                  E-Mail:{" "}
                  <a href="mailto:office@pixelpalast.at" className="text-primary hover:underline">
                    office@pixelpalast.at
                  </a>
                </p>
                <p>
                  Telefon:{" "}
                  <a href="tel:+436602545493" className="text-primary hover:underline">
                    +43 660 2545493
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Speicherdauer</h2>
              <p>
                Dass wir personenbezogene Daten nur so lange speichern, wie es für die Bereitstellung unserer Dienstleistungen und Produkte unbedingt notwendig ist, gilt als generelles Kriterium bei uns. Das bedeutet, dass wir personenbezogene Daten löschen, sobald der Grund für die Datenverarbeitung nicht mehr vorhanden ist.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Rechte laut Datenschutz-Grundverordnung</h2>
              <p>Gemäß DSGVO stehen Ihnen folgende Rechte zu:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Auskunftsrecht</strong> (Artikel 15 DSGVO)</li>
                <li><strong className="text-foreground">Recht auf Berichtigung</strong> (Artikel 16 DSGVO)</li>
                <li><strong className="text-foreground">Recht auf Löschung</strong> (Artikel 17 DSGVO)</li>
                <li><strong className="text-foreground">Recht auf Einschränkung der Verarbeitung</strong> (Artikel 18 DSGVO)</li>
                <li><strong className="text-foreground">Recht auf Datenübertragbarkeit</strong> (Artikel 20 DSGVO)</li>
                <li><strong className="text-foreground">Widerspruchsrecht</strong> (Artikel 21 DSGVO)</li>
                <li><strong className="text-foreground">Recht auf Beschwerde</strong> (Artikel 77 DSGVO)</li>
              </ul>
              <p className="mt-4">
                <strong className="text-foreground">Kurz gesagt:</strong> Sie haben Rechte – zögern Sie nicht, uns zu kontaktieren!
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Österreich Datenschutzbehörde</h2>
              <div className="bg-secondary/30 p-6 rounded-2xl space-y-1 not-prose">
                <p><strong className="text-foreground">Leiter:</strong> Dr. Matthias Schmidl</p>
                <p><strong className="text-foreground">Adresse:</strong> Barichgasse 40-42, 1030 Wien</p>
                <p><strong className="text-foreground">Telefon:</strong> +43 1 52 152-0</p>
                <p>
                  <strong className="text-foreground">E-Mail:</strong>{" "}
                  <a href="mailto:dsb@dsb.gv.at" className="text-primary hover:underline">dsb@dsb.gv.at</a>
                </p>
                <p>
                  <strong className="text-foreground">Website:</strong>{" "}
                  <a href="https://www.dsb.gv.at/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://www.dsb.gv.at/
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Kommunikation</h2>
              <p>
                Wenn Sie mit uns Kontakt aufnehmen und per Telefon, E-Mail oder Online-Formular kommunizieren, kann es zur Verarbeitung personenbezogener Daten kommen. Die Daten werden für die Abwicklung und Bearbeitung Ihrer Frage und des damit zusammenhängenden Geschäftsvorgangs verarbeitet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies</h2>
              <p>
                Unsere Website verwendet HTTP-Cookies, um nutzerspezifische Daten zu speichern. Cookies sind kleine Dateien, die von unserer Website auf Ihrem Computer gespeichert werden. Sie speichern gewisse Nutzerdaten von Ihnen, wie beispielsweise Sprache oder persönliche Seiteneinstellungen.
              </p>
              <p className="mt-4">
                Sie haben jederzeit die Möglichkeit, Cookies zu löschen, zu deaktivieren oder nur teilweise zuzulassen. Die Einstellungen finden Sie in Ihrem Browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Schlusswort</h2>
              <p>
                Uns ist es wichtig, Sie nach bestem Wissen und Gewissen über die Verarbeitung personenbezogener Daten zu informieren. Bei Fragen zum Thema Datenschutz auf unserer Website zögern Sie bitte nicht, uns zu kontaktieren.
              </p>
              <p className="mt-4 text-sm">
                Alle Texte sind urheberrechtlich geschützt.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}
