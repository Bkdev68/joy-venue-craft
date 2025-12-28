import { useState } from "react";
import { Section, SectionHeader } from "@/components/ui/section";

const galleryImages = [
  {
    src: "https://pixelpalast.at/wp-content/uploads/2025/07/Pixelpalast-ZE-59-scaled.jpg",
    alt: "Gäste beim Photobooth Event",
  },
  {
    src: "https://pixelpalast.at/wp-content/uploads/2025/07/Pixelpalast-ZE-28-1-scaled.jpg",
    alt: "360° Video Booth in Aktion",
  },
  {
    src: "https://pixelpalast.at/wp-content/uploads/2025/07/Pixelpalast-ZE-15-scaled.jpg",
    alt: "Elegante Eventfotografie",
  },
  {
    src: "https://pixelpalast.at/wp-content/uploads/2025/07/Pixelpalast-ZE-23-1-scaled.jpg",
    alt: "Hochzeits-Photobooth",
  },
  {
    src: "https://pixelpalast.at/wp-content/uploads/2025/07/BRIDGERTON-001-scaled.jpg",
    alt: "Gäste bei Bridgerton Event",
  },
  {
    src: "https://pixelpalast.at/wp-content/uploads/2025/07/BRIDGERTON-004-3-scaled.jpg",
    alt: "Photobooth Ergebnisse",
  },
];

export function GalleryPreviewSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Section variant="muted" id="galerie-preview">
      <SectionHeader
        subtitle="Unsere Arbeit"
        title="Eindrücke aus vergangenen Events"
        description="Lassen Sie sich von unseren Ergebnissen inspirieren und entdecken Sie, wie wir besondere Momente festhalten."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
          </div>
        ))}
      </div>
    </Section>
  );
}
