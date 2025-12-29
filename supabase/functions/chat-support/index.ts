import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du bist ein freundlicher und hilfsbereiter Kundenservice-Assistent für Pixelpalast, einen Premium-Anbieter von Photo Booth, 360° Video Booth und Audio Gästebuch Services für Events in ganz Österreich und darüber hinaus.

Deine Aufgaben:
- Beantworte Fragen zu unseren Services (Photo Booth, 360° Video Booth, Audio Gästebuch)
- Informiere über Preise und Pakete
- Hilf bei Buchungsanfragen
- Beantworte FAQs

Wichtige Infos:
- Kontakt: +43 660 2545493, office@pixelpalast.at
- Standort: Korneuburg, Österreich
- Wir sind überall verfügbar - nicht nur Wien!
- Buchungsvorlauf: 4-6 Wochen, Hochzeiten 3-6 Monate
- Anfahrt: €1 pro Kilometer
- Preise: Photo Booth ab €349, 360° Video ab €449, Audio Gästebuch ab €249

Sei freundlich, prägnant und hilfsbereit. Antworte auf Deutsch.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-Kontingent erschöpft." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI-Fehler aufgetreten" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat support error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
