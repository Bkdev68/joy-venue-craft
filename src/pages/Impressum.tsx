import { Layout } from "@/components/layout/Layout";

export default function Impressum() {
  return (
    <Layout>
      <section className="pt-32 pb-24">
        <div className="container max-w-3xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight mb-12">
            Impressum
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-foreground font-medium mb-6">
              Informationen über den Diensteanbieter.
            </p>

            <div className="space-y-1 mb-8">
              <p className="text-foreground font-semibold text-xl">Pixelpalast</p>
              <p>Marcel Fischer</p>
              <p>Wildstraße 5</p>
              <p>2100 Korneuburg</p>
              <p>Österreich</p>
            </div>

            <div className="space-y-3 mb-8">
              <p>
                <strong className="text-foreground">Tel.:</strong>{" "}
                <a href="tel:+436602545493" className="text-primary hover:underline">
                  +43 660 2545493
                </a>
              </p>
              <p>
                <strong className="text-foreground">E-Mail:</strong>{" "}
                <a href="mailto:office@pixelpalast.at" className="text-primary hover:underline">
                  office@pixelpalast.at
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <strong className="text-foreground">Unternehmensgegenstand:</strong> Dienstleister
              </p>
              <p>
                <strong className="text-foreground">Berufsrecht:</strong> Handelsgericht Wien
              </p>
              <p>
                <strong className="text-foreground">Verleihungsstaat:</strong> Österreich
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
