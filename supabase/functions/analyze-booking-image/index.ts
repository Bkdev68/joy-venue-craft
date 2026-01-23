import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: string;
  date: string;
  service_name: string;
  package_name: string;
  package_price: number;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    if (!supabaseKey) {
      throw new Error('Backend key is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.warn('Auth failed in analyze-booking-image:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kein Bild übermittelt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing booking image with Lovable AI...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Du bist ein Assistent zur Analyse von Buchungsanfragen aus Screenshots, E-Mails oder Fotos. Extrahiere die folgenden Informationen:
- Kundenname (customer_name)
- E-Mail-Adresse (customer_email)
- Telefonnummer (customer_phone) - falls vorhanden
- Art des Events aus: Hochzeit, Firmenevent, Geburtstag, Weihnachtsfeier, Jubiläum, Messe/Promotion, Sonstiges (event_type)
- Datum des Events im Format YYYY-MM-DD (date)
- Service/Leistung z.B. Photo Booth, 360° Video Booth, Audio Gästebuch (service_name)
- Paketname falls genannt (package_name)
- Preis falls genannt - nur die Zahl ohne Währungszeichen (package_price)
- Nachricht/Anmerkungen des Kunden (message)

Antworte NUR mit einem JSON-Objekt ohne Markdown-Formatierung. Wenn ein Feld nicht gefunden wird, verwende einen leeren String oder 0 für Zahlen.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analysiere dieses Bild und extrahiere alle Buchungsinformationen. Antworte nur mit dem JSON-Objekt."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_booking_data",
              description: "Extrahiert strukturierte Buchungsdaten aus einem Bild",
              parameters: {
                type: "object",
                properties: {
                  customer_name: { type: "string", description: "Name des Kunden" },
                  customer_email: { type: "string", description: "E-Mail-Adresse des Kunden" },
                  customer_phone: { type: "string", description: "Telefonnummer des Kunden" },
                  event_type: { 
                    type: "string", 
                    enum: ["Hochzeit", "Firmenevent", "Geburtstag", "Weihnachtsfeier", "Jubiläum", "Messe/Promotion", "Sonstiges"],
                    description: "Art des Events" 
                  },
                  date: { type: "string", description: "Datum des Events im Format YYYY-MM-DD" },
                  service_name: { type: "string", description: "Name der Leistung/des Services" },
                  package_name: { type: "string", description: "Name des Pakets" },
                  package_price: { type: "number", description: "Preis in Euro" },
                  message: { type: "string", description: "Zusätzliche Nachricht oder Anmerkungen" }
                },
                required: ["customer_name", "customer_email", "event_type", "date", "service_name"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_booking_data" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate Limit erreicht, bitte später erneut versuchen.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Guthaben aufgebraucht, bitte Credits aufladen.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const bookingData: BookingData = JSON.parse(toolCall.function.arguments);
      console.log('Extracted booking data:', bookingData);
      
      return new Response(
        JSON.stringify({ success: true, data: bookingData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try to parse content as JSON
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const cleanContent = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const bookingData: BookingData = JSON.parse(cleanContent);
        console.log('Parsed booking data from content:', bookingData);
        
        return new Response(
          JSON.stringify({ success: true, data: bookingData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', content);
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Konnte keine Buchungsdaten aus dem Bild extrahieren' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing booking image:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
