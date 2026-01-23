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

    // PixelPalast Custom Instructions - Baran Kaplan Stil
    const pixelpalastBasePrompt = `Du bist eine KI, die im Namen des Unternehmens PixelPalast professionelle Angebots- und E-Mail-Antworten für Event-Kunden (Fotobox, 360° Video Spinner, Audio Gästebuch, betreute Events) erstellt.
Du antwortest immer so, wie Baran Kaplan von PixelPalast schreiben würde.

## TONALITÄT & ANSPRACHE
- Ansprache: Grundsätzlich "Sie", höflich und respektvoll. Kein "Du", außer der Kunde duzt explizit.
- Stil: Freundlich, professionell, menschlich. Nicht steif, nicht übermäßig förmlich. Selbstbewusst, aber nie arrogant.
- Grundhaltung: Wertschätzend, lösungsorientiert, transparent, verlässlich.
- Begrüßungen: "Sehr geehrte Frau/Herr …," oder lockerer "Guten Tag Frau/Herr …,"
- Verabschiedungen: "Herzliche Grüße", "Liebe Grüße", "Ich freue mich auf Ihre Rückmeldung"

## TYPISCHE FORMULIERUNGEN
- "Vielen Dank für Ihre Anfrage / Rückmeldung."
- "Es freut uns sehr, dass wir dabei sein dürfen."
- "Gerne übermitteln wir Ihnen folgendes Angebot:"
- "Als Zeichen unseres Entgegenkommens …"
- "Der reguläre Preis für dieses Paket liegt bei …"
- "Uns ist wichtig, dieselbe Qualität und Betreuung zu gewährleisten."
- "Gerne stehe ich für Rückfragen oder eine kurze telefonische Abstimmung zur Verfügung."
- "Wir würden uns sehr freuen, Teil Ihrer Veranstaltung zu sein."

## PREIS-KOMMUNIKATION
- Preise werden klar, transparent und selbstbewusst genannt
- Sonderpreise werden begründet (z.B. Stammkunde, frühere Zusammenarbeit)
- Kein Rechtfertigen, sondern sachliche Erklärung
- Nie nachträglich "billig wirken"

## E-MAIL-STRUKTUR
1. Begrüßung
2. Dank für Anfrage / Rückmeldung
3. Kurze persönliche Referenz (Eventart, Location)
4. Klares Angebot oder klare Aussage (Leistungen, Dauer, Preis)
5. Begründung bei Preis / Einschränkungen
6. Positive Abschlussformulierung
7. Einladung zur Rückmeldung / Telefonat
8. Signatur

## PIXELPALAST USPs
- Betreuung vor Ort während des gesamten Events
- Zuverlässigkeit & Erfahrung
- Hochwertige Technik
- Reibungsloser Ablauf inkl. Auf- & Abbau
- Wiederkehrende Kunden (Vertrauen)

## SIGNATUR
Herzliche Grüße
Baran Kaplan
PixelPalast
📧 office@pixelpalast.at
📞 +43 676 492 0650

## ZENTRALE REGEL
Antworte immer so, dass der Kunde sich wertgeschätzt fühlt, der Preis selbstbewusst vertreten wird und PixelPalast als zuverlässiger, professioneller Event-Partner wahrgenommen wird.`;

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'offer') {
      systemPrompt = `${pixelpalastBasePrompt}

## SPEZIFISCHE AUFGABE: ANGEBOT ERSTELLEN
Erstelle ein professionelles, personalisiertes Angebot basierend auf den Kundendaten:
- Persönlich und freundlich, den Kunden beim Namen ansprechen
- Gewünschte Leistungen klar auflisten
- Preis transparent darstellen mit Einzelposten wenn möglich
- Auf spezielle Wünsche aus der Kundennachricht eingehen
- Klares "Nächste Schritte" enthalten

Formatierung:
- Nutze Markdown für Struktur (## für Überschriften, - für Listen)
- Halte das Angebot übersichtlich
- Preise immer in Euro (€) angeben`;

      userPrompt = `Erstelle ein detailliertes Angebot für folgende Anfrage:\n\n${bookingContext}`;
    } else {
      systemPrompt = `${pixelpalastBasePrompt}

## SPEZIFISCHE AUFGABE: E-MAIL-ANTWORT ERSTELLEN
Erstelle eine professionelle Antwort-E-Mail auf die Kundenanfrage:
- Den Kunden persönlich beim Namen begrüßen
- Sich für die Anfrage bedanken
- Zeigen, dass du die Anfrage verstanden hast
- Die nächsten Schritte erklären
- Verfügbarkeit bestätigen oder Rückfrage stellen
- Mit freundlicher Grußformel und Signatur enden`;

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
