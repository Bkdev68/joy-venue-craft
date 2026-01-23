import { useState } from "react";
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
  { id: "friends", label: "Freunde & Familie" },
  { id: "seen", label: "Vor Ort gesehen" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function EmbedContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [customerType, setCustomerType] = useState<"privat" | "firma">("privat");
  const [rentalObjects, setRentalObjects] = useState<string[]>([]);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventHour, setEventHour] = useState("18");
  const [eventMinute, setEventMinute] = useState("00");
  const [referralSources, setReferralSources] = useState<string[]>([]);

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white">Vielen Dank!</h2>
          <p className="text-zinc-400 text-lg">
            Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei Ihnen.
          </p>
          <Button
            onClick={() => setIsSuccess(false)}
            className="mt-6 bg-white text-black hover:bg-zinc-200"
          >
            Weitere Anfrage senden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-6">
            <Camera className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Jetzt anfragen
          </h1>
          <p className="text-zinc-500 mt-3 text-lg">
            Füllen Sie das Formular aus und wir melden uns bei Ihnen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Type Toggle */}
          <div className="space-y-3">
            <Label className="text-zinc-300 text-sm uppercase tracking-wider">
              Kundenart <span className="text-amber-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustomerType("privat")}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                  customerType === "privat"
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Privat</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerType("firma")}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                  customerType === "firma"
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Firma</span>
              </button>
            </div>
          </div>

          {/* Company Fields */}
          {customerType === "firma" && (
            <div className="space-y-4 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Firmenangaben
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-zinc-400">
                  Firmenname <span className="text-amber-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  required={customerType === "firma"}
                  maxLength={200}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="Musterfirma GmbH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_street" className="text-zinc-400">
                  Straße & Hausnummer <span className="text-amber-500">*</span>
                </Label>
                <Input
                  id="company_street"
                  name="company_street"
                  required={customerType === "firma"}
                  maxLength={200}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company_zip" className="text-zinc-400">
                    PLZ <span className="text-amber-500">*</span>
                  </Label>
                  <Input
                    id="company_zip"
                    name="company_zip"
                    required={customerType === "firma"}
                    maxLength={10}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                    placeholder="1010"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="company_city" className="text-zinc-400">
                    Stadt <span className="text-amber-500">*</span>
                  </Label>
                  <Input
                    id="company_city"
                    name="company_city"
                    required={customerType === "firma"}
                    maxLength={100}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                    placeholder="Wien"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_country" className="text-zinc-400">
                  Land
                </Label>
                <Input
                  id="company_country"
                  name="company_country"
                  defaultValue="Österreich"
                  maxLength={100}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Kontaktdaten
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-400">
                  Name <span className="text-amber-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <Input
                    id="name"
                    name="name"
                    required
                    maxLength={100}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 pl-10"
                    placeholder="Max Mustermann"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-400">
                  Telefon <span className="text-amber-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={30}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 pl-10"
                    placeholder="+43 660 1234567"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">
                E-Mail <span className="text-amber-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 pl-10"
                  placeholder="max@beispiel.at"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              Veranstaltungsdetails
            </h3>

            <div className="space-y-2">
              <Label htmlFor="venue" className="text-zinc-400">
                Veranstaltungsort <span className="text-amber-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input
                  id="venue"
                  name="venue"
                  required
                  maxLength={200}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 pl-10"
                  placeholder="z.B. Schloss Schönbrunn, Wien"
                />
              </div>
            </div>

            {/* Rental Objects - Multi Select */}
            <div className="space-y-3">
              <Label className="text-zinc-400">
                Mietobjekt(e) <span className="text-amber-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RENTAL_OBJECTS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleRentalObjectChange(item.value, !rentalObjects.includes(item.value))}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                      rentalObjects.includes(item.value)
                        ? "border-amber-500 bg-amber-500/10 text-white"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium text-sm text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label className="text-zinc-400">
                Art der Veranstaltung <span className="text-amber-500">*</span>
              </Label>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 focus:ring-amber-500/20 h-12">
                  <SelectValue placeholder="Bitte wählen..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {EVENT_TYPES.map((item) => (
                    <SelectItem 
                      key={item.value} 
                      value={item.value}
                      className="text-white focus:bg-amber-500/20 focus:text-white"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">
                  Datum <span className="text-amber-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600",
                        !eventDate && "text-zinc-600"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-zinc-500" />
                      {eventDate ? (
                        <span className="text-white">{format(eventDate, "dd. MMMM yyyy", { locale: de })}</span>
                      ) : (
                        <span>Datum wählen...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={de}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">
                  Uhrzeit <span className="text-amber-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Select value={eventHour} onValueChange={setEventHour}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-12 pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                        {HOURS.map((hour) => (
                          <SelectItem 
                            key={hour} 
                            value={hour}
                            className="text-white focus:bg-amber-500/20 focus:text-white"
                          >
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-zinc-500 text-xl font-bold">:</span>
                  <Select value={eventMinute} onValueChange={setEventMinute}>
                    <SelectTrigger className="w-24 bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {MINUTES.map((min) => (
                        <SelectItem 
                          key={min} 
                          value={min}
                          className="text-white focus:bg-amber-500/20 focus:text-white"
                        >
                          {min}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-zinc-400">
                Gewünschte Dauer in Stunden <span className="text-amber-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min={1}
                  max={24}
                  required
                  placeholder="3"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 pl-10"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-zinc-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Nähere Details <span className="text-amber-500">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              required
              maxLength={2000}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 resize-y"
              placeholder="Erzählen Sie uns mehr über Ihre Veranstaltung..."
            />
          </div>

          {/* Referral Sources */}
          <div className="space-y-3">
            <Label className="text-zinc-400">
              Wie sind Sie auf uns aufmerksam geworden?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {REFERRAL_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300",
                    referralSources.includes(option.id)
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  )}
                >
                  <Checkbox
                    id={option.id}
                    checked={referralSources.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleReferralChange(option.id, checked as boolean)
                    }
                    className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <span className="text-sm text-zinc-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || rentalObjects.length === 0 || !eventType || !eventDate}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black transition-all duration-300 shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Jetzt Anfragen
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
