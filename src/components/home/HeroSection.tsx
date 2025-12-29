import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/gallery/event-1.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      <div className="container relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Headline */}
        <div className="mb-6 opacity-0 animate-fade-in">
          <span className="inline-block text-primary font-medium text-sm tracking-wide">
            Photobooth & 360° Video
          </span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-foreground leading-[1.05] tracking-tight mb-6 opacity-0 animate-fade-in-up animation-delay-100">
          Unvergessliche
          <br />
          <span className="text-gradient">Erinnerungen</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in-up animation-delay-200">
          Professioneller Photobooth & 360° Video Service für Events, die in Erinnerung bleiben.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up animation-delay-300">
          <Button asChild size="lg" className="text-base px-8 h-14 rounded-full shadow-gold">
            <Link to="/buchen">
              Jetzt buchen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="text-base px-8 h-14 rounded-full">
            <Link to="/galerie">
              Galerie ansehen
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full max-w-6xl mx-auto mt-16 px-6 opacity-0 animate-fade-in-up animation-delay-400">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={heroImage}
            alt="Photobooth Event mit Gästen bei eleganter Veranstaltung"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
        </div>
      </div>

      {/* Stats - Apple style */}
      <div className="w-full max-w-4xl mx-auto mt-20 px-6 opacity-0 animate-fade-in animation-delay-500">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">500+</p>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Events</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">100%</p>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Zufriedenheit</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">Wien</p>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">& Umgebung</p>
          </div>
        </div>
      </div>
    </section>
  );
}
