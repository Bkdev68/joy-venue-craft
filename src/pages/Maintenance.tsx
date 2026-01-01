import { Construction, Mail, Phone } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function Maintenance() {
  return (
    <>
      <SEO
        title="Wartungsarbeiten | Pixelpalast"
        description="Unsere Webseite wird derzeit überarbeitet. Wir sind bald wieder für Sie da!"
        noIndex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-primary">
              PIXELPALAST
            </h1>
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Photo Booth & 360° Video Booth
            </p>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Wir arbeiten an etwas Großartigem!
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Unsere Webseite wird derzeit überarbeitet. Wir sind bald wieder für Sie da – noch besser als zuvor!
            </p>
          </div>

          {/* Contact Info */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Sie können uns weiterhin erreichen:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="mailto:office@pixelpalast.at"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                office@pixelpalast.at
              </a>
              <a
                href="tel:+436607347541"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +43 660 734 75 41
              </a>
            </div>
          </div>

          {/* Admin Link */}
          <div className="pt-4">
            <a
              href="/admin/login"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
