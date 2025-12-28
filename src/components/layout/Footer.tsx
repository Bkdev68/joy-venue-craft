import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold text-primary">Pixelpalast</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Unvergessliche Erinnerungen für Ihre Veranstaltung. Professioneller
              Photobooth & 360° Video Service in Wien und Umgebung.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/pixelpalast.at"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/pixelpalast"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Leistungen</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/leistungen/photobooth"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Photo Booth
                </Link>
              </li>
              <li>
                <Link
                  to="/leistungen/360-video-booth"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  360° Video Booth
                </Link>
              </li>
              <li>
                <Link
                  to="/galerie"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link
                  to="/preise"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Preise & Pakete
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Häufige Fragen
                </Link>
              </li>
              <li>
                <Link
                  to="/kontakt"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  to="/impressum"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  to="/datenschutz"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+436602545493"
                  className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>+43 660 2545493</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:office@pixelpalast.at"
                  className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>office@pixelpalast.at</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Wien, Österreich</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Pixelpalast. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6">
            <Link
              to="/impressum"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Impressum
            </Link>
            <Link
              to="/datenschutz"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
