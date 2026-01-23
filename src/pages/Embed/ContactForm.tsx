import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  Loader2, 
  Send, 
  CalendarIcon, 
  Clock, 
  Building2, 
  User,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Camera
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const RENTAL_OBJECTS = [
  { value: "photobooth", label: "Photo Booth", icon: "📸" },
  { value: "videobooth360", label: "360° Video Booth", icon: "🎬" },
  { value: "audioguestbook", label: "Audio Gästebuch", icon: "🎙️" },
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
  { id: "friends", label: "Freunde" },
  { id: "seen", label: "Vor Ort" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function EmbedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customerType, setCustomerType] = useState<"privat" | "firma">("privat");
  const [rentalObjects, setRentalObjects] = useState<string[]>([]);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventHour, setEventHour] = useState("18");
  const [eventMinute, setEventMinute] = useState("00");
  const [referralSources, setReferralSources] = useState<string[]>([]);

  // ResizeObserver for iframe auto-height
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sendHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        window.parent.postMessage(
          { type: "pixelpalast-embed-resize", height },
          "*"
        );
      }
    };

    // Initial send
    sendHeight();

    // Observe size changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also send on window resize
    window.addEventListener("resize", sendHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", sendHeight);
    };
  }, [isSuccess, customerType]); // Re-run when content changes significantly

  const handleRentalObjectChange = (value: string, checked: boolean) => {
    setRentalObjects((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

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
    
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      venue: formData.get("venue") as string,
      rental_object: rentalObjects.join(", "),
      event_type: eventType,
      event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
      event_time: `${eventHour}:${eventMinute}`,
      duration_hours: parseInt(formData.get("duration") as string) || null,
      message: formData.get("message") as string,
      referral_sources: referralSources.length > 0 ? referralSources : null,
      source: "embed",
      customer_type: customerType,
      company_name: customerType === "firma" ? formData.get("company_name") as string : null,
      company_street: customerType === "firma" ? formData.get("company_street") as string : null,
      company_zip: customerType === "firma" ? formData.get("company_zip") as string : null,
      company_city: customerType === "firma" ? formData.get("company_city") as string : null,
      company_country: customerType === "firma" ? formData.get("company_country") as string : null,
    };

    try {
      const { error: submitError } = await supabase
        .from("contact_submissions")
        .insert([data]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
      setRentalObjects([]);
      setEventType("");
      setEventDate(undefined);
      setReferralSources([]);
      setCustomerType("privat");
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div ref={containerRef} className="flex items-center justify-center p-8" style={{ backgroundColor: '#0C0C0B' }}>
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white">Vielen Dank!</h2>
          <p className="text-zinc-400">
            Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze.
          </p>
          <Button
            onClick={() => setIsSuccess(false)}
            className="mt-4 bg-white text-black hover:bg-zinc-200"
          >
            Weitere Anfrage senden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="text-white p-4 md:p-6" style={{ backgroundColor: '#0C0C0B' }}>
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 mb-3">
            <Camera className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Jetzt anfragen
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Füllen Sie das Formular aus und wir melden uns bei Ihnen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Type Toggle */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">
              Kundenart <span className="text-amber-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCustomerType("privat")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                  customerType === "privat"
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Privat</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerType("firma")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                  customerType === "firma"
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <Building2 className="w-4 h-4" />
                <span className="font-medium text-sm">Firma</span>
              </button>
            </div>
          </div>

          {/* Company Fields - Compact Grid */}
          {customerType === "firma" && (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Firmenangaben
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="company_name" className="text-zinc-400 text-xs">Firmenname *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    required={customerType === "firma"}
                    maxLength={200}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 h-9 text-sm"
                    placeholder="Musterfirma GmbH"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="company_street" className="text-zinc-400 text-xs">Straße & Nr. *</Label>
                  <Input
                    id="company_street"
                    name="company_street"
                    required={customerType === "firma"}
                    maxLength={200}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 h-9 text-sm"
                    placeholder="Musterstraße 123"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company_zip" className="text-zinc-400 text-xs">PLZ *</Label>
                  <Input
                    id="company_zip"
                    name="company_zip"
                    required={customerType === "firma"}
                    maxLength={10}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 h-9 text-sm"
                    placeholder="1010"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company_city" className="text-zinc-400 text-xs">Stadt *</Label>
                  <Input
                    id="company_city"
                    name="company_city"
                    required={customerType === "firma"}
                    maxLength={100}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 h-9 text-sm"
                    placeholder="Wien"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="company_country" className="text-zinc-400 text-xs">Land</Label>
                  <Input
                    id="company_country"
                    name="company_country"
                    defaultValue="Österreich"
                    maxLength={100}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact + Event in 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column - Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Kontaktdaten
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-zinc-400 text-xs">Name *</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                      id="name"
                      name="name"
                      required
                      maxLength={100}
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 pl-9 h-9 text-sm"
                      placeholder="Max Mustermann"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-zinc-400 text-xs">Telefon *</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={30}
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 pl-9 h-9 text-sm"
                      placeholder="+43 660 1234567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-zinc-400 text-xs">E-Mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 pl-9 h-9 text-sm"
                      placeholder="max@beispiel.at"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="venue" className="text-zinc-400 text-xs">Veranstaltungsort *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                      id="venue"
                      name="venue"
                      required
                      maxLength={200}
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 pl-9 h-9 text-sm"
                      placeholder="z.B. Schloss Schönbrunn"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Event Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                Eventdetails
              </h3>

              {/* Rental Objects - Compact */}
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Mietobjekt(e) *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {RENTAL_OBJECTS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleRentalObjectChange(item.value, !rentalObjects.includes(item.value))}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all",
                        rentalObjects.includes(item.value)
                          ? "border-amber-500 bg-amber-500/10 text-white"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-[10px] leading-tight text-center">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Type */}
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Art der Veranstaltung *</Label>
                <Select value={eventType} onValueChange={setEventType} required>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-9 text-sm">
                    <SelectValue placeholder="Bitte wählen..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {EVENT_TYPES.map((item) => (
                      <SelectItem 
                        key={item.value} 
                        value={item.value}
                        className="text-white focus:bg-amber-500/20 focus:text-white text-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date, Time, Duration - stacked on mobile, row on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Datum *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 justify-start text-left font-normal bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-sm px-3",
                          !eventDate && "text-zinc-600"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 shrink-0" />
                        {eventDate ? (
                          <span className="text-white">{format(eventDate, "dd.MM.yyyy", { locale: de })}</span>
                        ) : (
                          <span>Datum wählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={de}
                        className="pointer-events-auto p-3"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium text-white",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md inline-flex items-center justify-center",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-zinc-400 rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "h-9 w-9 text-center text-sm p-0 relative",
                          day: "h-9 w-9 p-0 font-normal text-white hover:bg-zinc-700 rounded-md inline-flex items-center justify-center",
                          day_range_end: "day-range-end",
                          day_selected: "bg-amber-500 text-black hover:bg-amber-600 hover:text-black focus:bg-amber-500 focus:text-black",
                          day_today: "bg-zinc-700 text-white",
                          day_outside: "text-zinc-600 opacity-50",
                          day_disabled: "text-zinc-600 opacity-50",
                          day_hidden: "invisible",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Uhrzeit *</Label>
                  <div className="flex items-center gap-2">
                    <Select value={eventHour} onValueChange={setEventHour}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-9 text-sm px-3 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 max-h-48 z-50">
                        {HOURS.map((hour) => (
                          <SelectItem 
                            key={hour} 
                            value={hour}
                            className="text-white focus:bg-amber-500/20 text-sm"
                          >
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-zinc-500 text-sm font-medium">:</span>
                    <Select value={eventMinute} onValueChange={setEventMinute}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-9 text-sm px-3 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 z-50">
                        {MINUTES.map((min) => (
                          <SelectItem 
                            key={min} 
                            value={min}
                            className="text-white focus:bg-amber-500/20 text-sm"
                          >
                            {min}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-zinc-500 text-xs">Uhr</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="duration" className="text-zinc-400 text-xs">Dauer (Std) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min={1}
                      max={24}
                      required
                      placeholder="z.B. 3"
                      className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 pl-10 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message - Compact */}
          <div className="space-y-1">
            <Label htmlFor="message" className="text-zinc-400 text-xs flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-amber-500" />
              Nähere Details *
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              required
              maxLength={2000}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 resize-none text-sm"
              placeholder="Erzählen Sie uns mehr über Ihre Veranstaltung..."
            />
          </div>

          {/* Referral Sources - Single Row */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Wie haben Sie uns gefunden?</Label>
            <div className="flex flex-wrap gap-2">
              {REFERRAL_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-xs",
                    referralSources.includes(option.id)
                      ? "border-amber-500/50 bg-amber-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  <Checkbox
                    id={option.id}
                    checked={referralSources.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleReferralChange(option.id, checked as boolean)
                    }
                    className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 w-3 h-3"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || rentalObjects.length === 0 || !eventType || !eventDate}
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black transition-all shadow-lg shadow-amber-500/20"
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
