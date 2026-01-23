import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_type?: string;
  company_name?: string;
  date: string;
  event_type: string;
  event_time?: string;
  duration_hours?: number;
  venue?: string;
  service_name: string;
  package_name: string;
  package_price: number;
  message?: string;
  referral_sources?: string[];
}

interface RequestBody {
  booking: BookingData;
  type: 'offer' | 'email';
  calculatedPrice?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking, type, calculatedPrice }: RequestBody = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about the booking
    const bookingContext = `
Kundeninformationen:
- Name: ${booking.customer_name}
- E-Mail: ${booking.customer_email}
- Telefon: ${booking.customer_phone || 'Nicht angegeben'}
- Kundentyp: ${booking.customer_type === 'firma' ? 'Firmenkunde' : 'Privatkunde'}
${booking.company_name ? `- Firma: ${booking.company_name}` : ''}

Veranstaltungsdetails:
- Datum: ${booking.date}
- Event-Typ: ${booking.event_type}
${booking.event_time ? `- Uhrzeit: ${booking.event_time} Uhr` : ''}
${booking.duration_hours ? `- Dauer: ${booking.duration_hours} Stunden` : ''}
${booking.venue ? `- Veranstaltungsort: ${booking.venue}` : ''}

Gewünschte Leistungen:
- Service: ${booking.service_name}
- Paket: ${booking.package_name}
- Ursprünglicher Preis: €${booking.package_price}
${calculatedPrice ? `- Kalkulierter Preis: €${calculatedPrice}` : ''}

${booking.message ? `Kundennachricht:\n"${booking.message}"` : ''}

${booking.referral_sources?.length ? `Gefunden über: ${booking.referral_sources.join(', ')}` : ''}
    `.trim();

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'offer') {
      systemPrompt = `Du bist ein professioneller Angebotsersteller für PixelPalast, einen Premium-Anbieter für Photo Booths, 360° Video Booths und Audio Gästebücher in Österreich.

Erstelle ein professionelles, personalisiertes Angebot basierend auf den Kundendaten. Das Angebot sollte:
- Persönlich und freundlich sein, den Kunden beim Namen ansprechen
- Die gewünschten Leistungen klar auflisten
- Den Preis transparent darstellen mit Einzelposten wenn möglich
- Auf spezielle Wünsche aus der Kundennachricht eingehen
- Ein klares "Nächste Schritte" enthalten
- Professionell aber herzlich formuliert sein

Verwende folgende Formatierung:
- Nutze Markdown für Struktur (## für Überschriften, - für Listen)
- Halte das Angebot übersichtlich und nicht zu lang
- Preise immer in Euro (€) angeben`;

      userPrompt = `Erstelle ein detailliertes Angebot für folgende Anfrage:\n\n${bookingContext}`;
    } else {
      systemPrompt = `Du bist ein freundlicher Kundenservice-Mitarbeiter von PixelPalast, einem Premium-Anbieter für Photo Booths, 360° Video Booths und Audio Gästebücher in Österreich.

Erstelle eine professionelle, herzliche Antwort-E-Mail auf die Kundenanfrage. Die E-Mail sollte:
- Den Kunden persönlich beim Namen begrüßen
- Sich für die Anfrage bedanken
- Zeigen, dass du die Anfrage verstanden hast
- Die nächsten Schritte erklären
- Verfügbarkeit bestätigen oder Rückfrage stellen
- Mit einer freundlichen Grußformel enden
- Kontaktmöglichkeiten anbieten

Signiere mit:
Mit freundlichen Grüßen,
Ihr PixelPalast Team

Wichtig:
- Schreibe in einem warmen, aber professionellen Ton
- Verwende die Du-Form wenn Privatkunde, Sie-Form wenn Firmenkunde
- Halte die E-Mail prägnant aber vollständig`;

      userPrompt = `Erstelle eine Antwort-E-Mail für folgende Anfrage:\n\n${bookingContext}`;
    }

    console.log(`Generating ${type} for booking: ${booking.customer_name}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuchen Sie es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI-Kontingent aufgebraucht. Bitte laden Sie Ihr Guthaben auf." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Keine Antwort von der KI erhalten");
    }

    console.log(`Successfully generated ${type}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content,
        type 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error generating AI response:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unbekannter Fehler" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
