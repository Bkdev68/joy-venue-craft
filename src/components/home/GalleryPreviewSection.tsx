import { Section, SectionHeader } from "@/components/ui/section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
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
];

function GalleryImage({ image, index }: { image: typeof galleryImages[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
    </div>
  );
}

export function GalleryPreviewSection() {
  return (
    <Section variant="muted" id="galerie-preview">
      <SectionHeader
        subtitle="Galerie"
        title="Eindrücke aus Events"
        description="Entdecken Sie, wie wir besondere Momente festhalten."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        {galleryImages.map((image, index) => (
          <GalleryImage key={index} image={image} index={index} />
        ))}
      </div>
    </Section>
  );
}
