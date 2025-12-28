import { useState } from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import event1 from "@/assets/gallery/event-1.jpg";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";
import event4 from "@/assets/gallery/event-4.jpg";
import event5 from "@/assets/gallery/event-5.jpg";

const galleryImages = [
  { src: event1, alt: "Gäste beim Photobooth Event" },
  { src: event2, alt: "360° Video Booth in Aktion" },
  { src: event3, alt: "Elegante Eventfotografie" },
  { src: event4, alt: "Hochzeits-Photobooth" },
  { src: event5, alt: "Photobooth Ergebnisse" },
  { src: event1, alt: "Professioneller Eventservice" },
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
