import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import event1 from "@/assets/gallery/event-1.jpg";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";
import event4 from "@/assets/gallery/event-4.jpg";
import event5 from "@/assets/gallery/event-5.jpg";

const categories = ["Alle", "Hochzeiten", "Firmenevents", "Geburtstage", "360° Videos"];

const galleryImages = [
  { src: event1, alt: "Hochzeits-Photobooth", category: "Hochzeiten" },
  { src: event2, alt: "Firmenevent", category: "Firmenevents" },
  { src: event3, alt: "360° Video Aufnahme", category: "360° Videos" },
  { src: event4, alt: "Geburtstagsfeier", category: "Geburtstage" },
  { src: event5, alt: "Elegante Hochzeit", category: "Hochzeiten" },
  { src: event1, alt: "Corporate Event", category: "Firmenevents" },
  { src: event2, alt: "Hochzeitsfeier", category: "Hochzeiten" },
  { src: event3, alt: "360° Slow Motion", category: "360° Videos" },
  { src: event4, alt: "Geburtstag Party", category: "Geburtstage" },
  { src: event5, alt: "Firmenevent Gala", category: "Firmenevents" },
  { src: event1, alt: "360° Event Video", category: "360° Videos" },
  { src: event2, alt: "Hochzeitsmoment", category: "Hochzeiten" },
];

export default function Galerie() {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages =
    activeCategory === "Alle"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4">
              Galerie
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Eindrücke aus vergangenen <span className="text-primary">Events</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Lassen Sie sich von unseren Ergebnissen inspirieren und entdecken Sie, 
              wie wir besondere Momente festhalten.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Section>
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-background font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ansehen
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-background hover:text-primary transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage}
            alt="Vollbild"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* CTA */}
      <Section variant="muted">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Möchten Sie auch solche Erinnerungen?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Buchen Sie noch heute und lassen Sie uns gemeinsam unvergessliche Momente schaffen.
          </p>
          <Button asChild size="lg" className="shadow-gold">
            <Link to="/buchen">
              Jetzt buchen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Section>
    </Layout>
  );
}
