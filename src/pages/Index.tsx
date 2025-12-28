import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { GalleryPreviewSection } from "@/components/home/GalleryPreviewSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
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
