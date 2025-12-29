import { Section, SectionHeader } from "@/components/ui/section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import event1 from "@/assets/gallery/event-1.jpg";
import event2 from "@/assets/gallery/event-2.jpg";
import event3 from "@/assets/gallery/event-3.jpg";
import event4 from "@/assets/gallery/event-4.jpg";
import event5 from "@/assets/gallery/event-5.jpg";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

const fallbackImages = [
  { id: '1', src: event1, alt: "Gäste beim Photobooth Event" },
  { id: '2', src: event2, alt: "360° Video Booth in Aktion" },
  { id: '3', src: event3, alt: "Elegante Eventfotografie" },
  { id: '4', src: event4, alt: "Hochzeits-Photobooth" },
  { id: '5', src: event5, alt: "Photobooth Ergebnisse" },
];

function GalleryImage({ image, index }: { image: GalleryImage; index: number }) {
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
  const { getContent } = useSiteContent();
  const [images, setImages] = useState<GalleryImage[]>([]);

  const subtitle = getContent('gallery_section', 'subtitle', 'Galerie');
  const title = getContent('gallery_section', 'title', 'Eindrücke aus Events');
  const description = getContent('gallery_section', 'description', 'Entdecken Sie, wie wir besondere Momente festhalten.');

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(5);

      if (!error && data && data.length > 0) {
        setImages(data);
      }
    };

    fetchImages();
  }, []);

  const displayImages = images.length > 0 ? images : fallbackImages;

  return (
    <Section variant="muted" id="galerie-preview">
      <SectionHeader
        subtitle={subtitle}
        title={title}
        description={description}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        {displayImages.map((image, index) => (
          <GalleryImage key={image.id} image={image} index={index} />
        ))}
      </div>
    </Section>
  );
}
