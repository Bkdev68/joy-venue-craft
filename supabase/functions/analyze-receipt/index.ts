import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptData {
  vendor: string;
  description: string;
  amount: number;
  date: string;
  receipt_number: string;
  category_suggestion: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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

    console.log('Analyzing receipt with Lovable AI...');

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
            content: `Du bist ein Assistent zur Analyse von Rechnungen und Belegen. Extrahiere die folgenden Informationen aus dem Bild:
- Lieferant/Verkäufer (vendor)
- Beschreibung der Leistung/Produkte (description)
- Gesamtbetrag in Euro (amount) - nur die Zahl ohne Währungszeichen
- Datum der Rechnung im Format YYYY-MM-DD (date)
- Rechnungsnummer (receipt_number)
- Kategorie-Vorschlag aus: Equipment, Software, Marketing, Reisen, Büro, Versicherung, Sonstiges (category_suggestion)

Antworte NUR mit einem JSON-Objekt ohne Markdown-Formatierung.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analysiere diese Rechnung und extrahiere die relevanten Daten. Antworte nur mit dem JSON-Objekt."
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
              name: "extract_receipt_data",
              description: "Extrahiert strukturierte Daten aus einer Rechnung",
              parameters: {
                type: "object",
                properties: {
                  vendor: { type: "string", description: "Name des Lieferanten/Verkäufers" },
                  description: { type: "string", description: "Beschreibung der Leistung/Produkte" },
                  amount: { type: "number", description: "Gesamtbetrag in Euro" },
                  date: { type: "string", description: "Rechnungsdatum im Format YYYY-MM-DD" },
                  receipt_number: { type: "string", description: "Rechnungsnummer" },
                  category_suggestion: { 
                    type: "string", 
                    enum: ["Equipment", "Software", "Marketing", "Reisen", "Büro", "Versicherung", "Sonstiges"],
                    description: "Vorgeschlagene Kategorie" 
                  }
                },
                required: ["vendor", "description", "amount", "date"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_receipt_data" } }
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
      const receiptData: ReceiptData = JSON.parse(toolCall.function.arguments);
      console.log('Extracted receipt data:', receiptData);
      
      return new Response(
        JSON.stringify({ success: true, data: receiptData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try to parse content as JSON
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        // Remove potential markdown code blocks
        const cleanContent = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const receiptData: ReceiptData = JSON.parse(cleanContent);
        console.log('Parsed receipt data from content:', receiptData);
        
        return new Response(
          JSON.stringify({ success: true, data: receiptData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', content);
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Konnte keine Daten aus der Rechnung extrahieren' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing receipt:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
