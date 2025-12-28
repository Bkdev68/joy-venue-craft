import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4 opacity-0 animate-fade-in">
              Photobooth & 360° Video Service
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6 opacity-0 animate-fade-in-up animation-delay-100">
              Unvergessliche Erinnerungen für{" "}
              <span className="text-primary">Ihre Veranstaltung</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 opacity-0 animate-fade-in-up animation-delay-200">
              Egal ob Firmenevents, Hochzeiten, Geburtstage oder Weihnachtsfeiern – 
              wir sorgen für unvergessliche Eventfotos und Videos, die die Freude 
              und Magie Ihrer Feier perfekt festhalten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up animation-delay-300">
              <Button asChild size="lg" className="shadow-gold text-base">
                <Link to="/buchen">
                  Jetzt Termin buchen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/galerie">
                  <Play className="mr-2 h-5 w-5" />
                  Galerie ansehen
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-border opacity-0 animate-fade-in animation-delay-500">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Events</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Zufriedenheit</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-foreground">Wien</p>
                  <p className="text-sm text-muted-foreground">& Umgebung</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative opacity-0 animate-slide-in-right animation-delay-300">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://pixelpalast.at/wp-content/uploads/2025/07/BRIDGERTON-184-scaled.jpg"
                alt="Photobooth Event mit Gästen bei eleganter Veranstaltung"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Sofortdruck</p>
                  <p className="text-sm text-muted-foreground">Direkt vor Ort</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
