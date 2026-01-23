import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Send } from "lucide-react";

const RENTAL_OBJECTS = [
  { value: "photobooth", label: "Photo Booth" },
  { value: "videobooth360", label: "360° Video Booth" },
  { value: "audioguestbook", label: "Audio Gästebuch" },
];

const EVENT_TYPES = [
  { value: "hochzeit", label: "Hochzeit" },
  { value: "firmenfeier", label: "Firmenfeier" },
  { value: "geburtstag", label: "Geburtstag" },
  { value: "messe", label: "Messe / Event" },
  { value: "sonstiges", label: "Sonstiges" },
];

const REFERRAL_OPTIONS = [
  { id: "instagram", label: "Instagram" },
  { id: "google", label: "Google" },
  { id: "friends", label: "Freunde & Familie" },
  { id: "seen", label: "Vor Ort gesehen" },
];

export default function EmbedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalObject, setRentalObject] = useState("");
  const [eventType, setEventType] = useState("");
  const [referralSources, setReferralSources] = useState<string[]>([]);

  const handleReferralChange = (id: string, checked: boolean) => {
    setReferralSources((prev) =>
      checked ? [...prev, id] : prev.filter((s) => s !== id)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const eventDate = formData.get("event_date") as string;
    const eventTime = `${formData.get("event_hour") || "00"}:${formData.get("event_minute") || "00"}`;
    
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      venue: formData.get("venue") as string,
      rental_object: rentalObject,
      event_type: eventType,
      event_date: eventDate || null,
      event_time: eventTime,
      duration_hours: parseInt(formData.get("duration") as string) || null,
      message: formData.get("message") as string,
      referral_sources: referralSources.length > 0 ? referralSources : null,
      source: "embed",
    };

    try {
      const { error: submitError } = await supabase
        .from("contact_submissions")
        .insert([data]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
      setRentalObject("");
      setEventType("");
      setReferralSources([]);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Vielen Dank!</h2>
          <p className="text-muted-foreground">
            Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei Ihnen.
          </p>
          <Button
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="mt-4"
          >
            Weitere Anfrage senden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Kontakt
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={100}
              className="bg-muted/50 border-muted-foreground/20 focus:border-primary"
            />
          </div>

          {/* Telefon */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              maxLength={30}
              className="bg-muted/50 border-muted-foreground/20 focus:border-primary"
            />
          </div>

          {/* E-Mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              E-Mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              className="bg-muted/50 border-muted-foreground/20 focus:border-primary"
            />
          </div>

          {/* Veranstaltungsort */}
          <div className="space-y-2">
            <Label htmlFor="venue" className="text-foreground">
              Veranstaltungsort <span className="text-destructive">*</span>
            </Label>
            <Input
              id="venue"
              name="venue"
              required
              maxLength={200}
              className="bg-muted/50 border-muted-foreground/20 focus:border-primary"
            />
          </div>

          {/* Mietobjekt */}
          <div className="space-y-2">
            <Label className="text-foreground">
              Mietobjekt <span className="text-destructive">*</span>
            </Label>
            <Select value={rentalObject} onValueChange={setRentalObject} required>
              <SelectTrigger className="bg-muted/50 border-muted-foreground/20 focus:border-primary">
                <SelectValue placeholder="Wählen Sie ein Mietobjekt" />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_OBJECTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Art der Veranstaltung */}
          <div className="space-y-2">
            <Label className="text-foreground">
              Art der Veranstaltung <span className="text-destructive">*</span>
            </Label>
            <Select value={eventType} onValueChange={setEventType} required>
              <SelectTrigger className="bg-muted/50 border-muted-foreground/20 focus:border-primary">
                <SelectValue placeholder="Wählen Sie die Art der Veranstaltung" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datum/Uhrzeit */}
          <div className="space-y-2">
            <Label className="text-foreground">
              Datum/Uhrzeit <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="date"
                name="event_date"
                required
                className="bg-muted/50 border-muted-foreground/20 focus:border-primary flex-1"
              />
              <div className="flex gap-2 items-center">
                <Select name="event_hour" defaultValue="00">
                  <SelectTrigger className="w-20 bg-muted/50 border-muted-foreground/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">:</span>
                <Select name="event_minute" defaultValue="00">
                  <SelectTrigger className="w-20 bg-muted/50 border-muted-foreground/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["00", "15", "30", "45"].map((min) => (
                      <SelectItem key={min} value={min}>
                        {min}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Gewünschte Dauer in Stunden */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-foreground">
              Gewünschte Dauer in Stunden <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min={1}
              max={24}
              required
              placeholder="0"
              className="bg-muted/50 border-muted-foreground/20 focus:border-primary"
            />
          </div>

          {/* Nähere Details */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">
              Nähere Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={6}
              required
              maxLength={2000}
              className="bg-muted/50 border-muted-foreground/20 focus:border-primary resize-y"
            />
          </div>

          {/* Wie sind sie auf uns aufmerksam geworden? */}
          <div className="space-y-3">
            <Label className="text-foreground">
              Wie sind Sie auf uns aufmerksam geworden?
            </Label>
            <div className="space-y-2">
              {REFERRAL_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={referralSources.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleReferralChange(option.id, checked as boolean)
                    }
                    className="border-muted-foreground/40"
                  />
                  <label
                    htmlFor={option.id}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !rentalObject || !eventType}
            className="w-full sm:w-auto px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Jetzt Anfragen
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
