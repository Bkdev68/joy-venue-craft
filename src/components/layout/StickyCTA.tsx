import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { trackCTA } from "@/hooks/useAnalytics";

export function StickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border p-4 safe-area-inset-bottom">
      <Button 
        asChild 
        className="w-full shadow-gold" 
        size="lg"
        onClick={() => trackCTA('Jetzt buchen', 'sticky_mobile')}
      >
        <Link to="/buchen" className="flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>Jetzt buchen</span>
        </Link>
      </Button>
    </div>
  );
}
