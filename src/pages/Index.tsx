import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { GalleryPreviewSection } from "@/components/home/GalleryPreviewSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <Layout>
      <SEO 
        title="Photo Booth & 360° Video Booth mieten"
        description="Professionelle Fotobox, 360° Video Booth und Audio Gästebuch für Hochzeiten, Firmenevents und Feiern in ganz Österreich. Ab €349. Jetzt unverbindlich anfragen!"
        keywords="Photo Booth mieten, Fotobox Hochzeit, 360 Video Booth, Audio Gästebuch, Wien, Österreich, Event Entertainment, Hochzeitsfotografie"
        url="https://pixelpalast.at"
      />
      <HeroSection />
      <ServicesSection />
      <BenefitsSection />
      <ProcessSection />
      <GalleryPreviewSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
