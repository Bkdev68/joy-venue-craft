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
  { value: "videobooth360", label: "360° Video", icon: "🎬" },
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
      <div className="min-h-[400px] flex items-center justify-center p-6 bg-black">
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
    <div className="bg-black text-white px-6 py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-3">
          <Camera className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-white">Jetzt anfragen</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Füllen Sie das Formular aus und wir melden uns bei Ihnen
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl mx-auto">
        {/* Customer Type Toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCustomerType("privat")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all font-medium",
              customerType === "privat"
                ? "border-amber-500 bg-amber-500/20 text-amber-400"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <User className="w-4 h-4" />
            Privat
          </button>
          <button
            type="button"
            onClick={() => setCustomerType("firma")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all font-medium",
              customerType === "firma"
                ? "border-amber-500 bg-amber-500/20 text-amber-400"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <Building2 className="w-4 h-4" />
            Firma
          </button>
        </div>

        {/* Company Fields */}
        {customerType === "firma" && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="col-span-2 md:col-span-2">
              <Input
                name="company_name"
                required
                maxLength={200}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 h-10"
                placeholder="Firmenname *"
              />
            </div>
            <div className="col-span-2 md:col-span-3">
              <Input
                name="company_street"
                required
                maxLength={200}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 h-10"
                placeholder="Straße & Nr. *"
              />
            </div>
            <div>
              <Input
                name="company_zip"
                required
                maxLength={10}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 h-10"
                placeholder="PLZ *"
              />
            </div>
            <div>
              <Input
                name="company_city"
                required
                maxLength={100}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 h-10"
                placeholder="Stadt *"
              />
            </div>
            <div className="col-span-2 md:col-span-3">
              <Input
                name="company_country"
                defaultValue="Österreich"
                maxLength={100}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 h-10"
                placeholder="Land"
              />
            </div>
          </div>
        )}

        {/* Main Grid - 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              name="name"
              required
              maxLength={100}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 pl-10 h-11"
              placeholder="Name *"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              name="phone"
              type="tel"
              required
              maxLength={30}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 pl-10 h-11"
              placeholder="Telefon *"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              name="email"
              type="email"
              required
              maxLength={255}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 pl-10 h-11"
              placeholder="E-Mail *"
            />
          </div>

          {/* Venue */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              name="venue"
              required
              maxLength={200}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 pl-10 h-11"
              placeholder="Veranstaltungsort *"
            />
          </div>
        </div>

        {/* Second Row - Event Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Rental Objects */}
          <div className="col-span-2 md:col-span-1">
            <Label className="text-zinc-400 text-xs mb-2 block">Mietobjekt(e) *</Label>
            <div className="flex gap-2">
              {RENTAL_OBJECTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleRentalObjectChange(item.value, !rentalObjects.includes(item.value))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition-all",
                    rentalObjects.includes(item.value)
                      ? "border-amber-500 bg-amber-500/20 text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[9px] font-medium leading-tight text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Type */}
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">Veranstaltung *</Label>
            <Select value={eventType} onValueChange={setEventType} required>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-11">
                <SelectValue placeholder="Wählen..." />
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

          {/* Date */}
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">Datum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal bg-zinc-900 border-zinc-700 hover:bg-zinc-800",
                    !eventDate && "text-zinc-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                  {eventDate ? format(eventDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
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
                  className="pointer-events-auto bg-zinc-900 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-zinc-400 text-xs mb-2 block">Uhrzeit</Label>
              <div className="flex items-center gap-1">
                <Select value={eventHour} onValueChange={setEventHour}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-11 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 max-h-48">
                    {HOURS.map((hour) => (
                      <SelectItem key={hour} value={hour} className="text-white focus:bg-amber-500/20">
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-zinc-500">:</span>
                <Select value={eventMinute} onValueChange={setEventMinute}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white focus:border-amber-500 h-11 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {MINUTES.map((min) => (
                      <SelectItem key={min} value={min} className="text-white focus:bg-amber-500/20">
                        {min}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-2 block">Dauer (Std)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  name="duration"
                  type="number"
                  min={1}
                  max={24}
                  required
                  placeholder="3"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 pl-10 h-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message & Referral Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label className="text-zinc-400 text-xs mb-2 block">Nähere Details *</Label>
            <Textarea
              name="message"
              rows={3}
              required
              maxLength={2000}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 resize-none"
              placeholder="Erzählen Sie uns mehr über Ihre Veranstaltung..."
            />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">Wie gefunden?</Label>
            <div className="grid grid-cols-2 gap-2">
              {REFERRAL_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm",
                    referralSources.includes(option.id)
                      ? "border-amber-500/50 bg-amber-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  <Checkbox
                    id={option.id}
                    checked={referralSources.includes(option.id)}
                    onCheckedChange={(checked) => handleReferralChange(option.id, checked as boolean)}
                    className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 w-4 h-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || rentalObjects.length === 0 || !eventType || !eventDate}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black transition-all shadow-lg shadow-amber-500/25 rounded-xl"
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
  );
}
