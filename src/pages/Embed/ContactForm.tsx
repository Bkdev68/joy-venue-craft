import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Send, CheckCircle, Loader2 } from "lucide-react";

export default function EmbedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      event_date: (formData.get("event_date") as string) || null,
      subject: (formData.get("subject") as string) || null,
      message: formData.get("message") as string,
      source: "embed",
    };

    try {
      const { error: submitError } = await supabase
        .from("contact_submissions")
        .insert([data]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Kontaktieren Sie uns</h2>
          <p className="text-muted-foreground text-sm">
            Wir freuen uns auf Ihre Anfrage
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ihr Name"
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ihre@email.at"
                required
                maxLength={255}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+43 ..."
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Event-Datum</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Worum geht es?"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Nachricht *</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Ihre Nachricht an uns..."
              rows={4}
              required
              maxLength={2000}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Anfrage senden
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
          </p>
        </form>
      </div>
    </div>
  );
}
