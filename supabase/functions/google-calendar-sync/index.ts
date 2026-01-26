import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Calendar API base URL
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

interface BookingData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  event_type: string;
  date: string;
  event_time?: string;
  duration_hours?: number;
  venue?: string;
  service_name: string;
  package_name: string;
  package_price: number;
  message?: string;
  assigned_staff?: string[];
  status: string;
  google_calendar_event_id?: string;
}

interface SyncRequest {
  action: "create" | "update" | "delete";
  booking: BookingData;
}

// Get access token using service account credentials
async function getAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  
  if (!email || !privateKey) {
    throw new Error("Google Service Account credentials not configured");
  }

  // Create JWT header
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  // Create JWT claim set
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Base64url encode
  const base64urlEncode = (obj: object): string => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerEncoded = base64urlEncode(header);
  const claimEncoded = base64urlEncode(claim);
  const signatureInput = `${headerEncoded}.${claimEncoded}`;

  // Import private key and sign
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  let keyContent = privateKey.replace(/\\n/g, "\n");
  keyContent = keyContent.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(keyContent), (c) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error("Token exchange failed:", error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Format time for Google Calendar (ISO 8601)
function formatEventTime(date: string, time?: string, durationHours?: number): { start: string; end: string } {
  const eventDate = new Date(date);
  
  if (time) {
    const [hours, minutes] = time.split(":").map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    eventDate.setHours(10, 0, 0, 0); // Default to 10:00
  }
  
  const duration = durationHours || 3; // Default 3 hours
  const endDate = new Date(eventDate.getTime() + duration * 60 * 60 * 1000);
  
  // Format as RFC3339 with timezone
  const formatDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00+01:00`;
  };
  
  return {
    start: formatDate(eventDate),
    end: formatDate(endDate),
  };
}

// Create Google Calendar event
async function createCalendarEvent(booking: BookingData, accessToken: string): Promise<string> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID not configured");
  }

  const { start, end } = formatEventTime(booking.date, booking.event_time, booking.duration_hours);
  
  const staffInfo = booking.assigned_staff?.length 
    ? `\n\n👥 Zugewiesene Mitarbeiter:\n${booking.assigned_staff.join(", ")}`
    : "";
  
  const event = {
    summary: `${booking.customer_name} - ${booking.event_type}`,
    description: `📦 Paket: ${booking.package_name} (${booking.service_name})
💰 Preis: €${booking.package_price}
📧 E-Mail: ${booking.customer_email}
📞 Telefon: ${booking.customer_phone || "Nicht angegeben"}
${booking.message ? `\n📝 Nachricht:\n${booking.message}` : ""}${staffInfo}

🔗 Buchungs-ID: ${booking.id}`,
    location: booking.venue || "",
    start: {
      dateTime: start,
      timeZone: "Europe/Vienna",
    },
    end: {
      dateTime: end,
      timeZone: "Europe/Vienna",
    },
    colorId: "9", // Blue color
  };

  console.log("Creating calendar event:", event.summary);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to create event:", error);
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const createdEvent = await response.json();
  console.log("Event created successfully:", createdEvent.id);
  return createdEvent.id;
}

// Update Google Calendar event
async function updateCalendarEvent(booking: BookingData, accessToken: string): Promise<void> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId || !booking.google_calendar_event_id) {
    throw new Error("Calendar ID or Event ID not available");
  }

  const { start, end } = formatEventTime(booking.date, booking.event_time, booking.duration_hours);
  
  const staffInfo = booking.assigned_staff?.length 
    ? `\n\n👥 Zugewiesene Mitarbeiter:\n${booking.assigned_staff.join(", ")}`
    : "";
  
  const event = {
    summary: `${booking.customer_name} - ${booking.event_type}`,
    description: `📦 Paket: ${booking.package_name} (${booking.service_name})
💰 Preis: €${booking.package_price}
📧 E-Mail: ${booking.customer_email}
📞 Telefon: ${booking.customer_phone || "Nicht angegeben"}
${booking.message ? `\n📝 Nachricht:\n${booking.message}` : ""}${staffInfo}

🔗 Buchungs-ID: ${booking.id}`,
    location: booking.venue || "",
    start: {
      dateTime: start,
      timeZone: "Europe/Vienna",
    },
    end: {
      dateTime: end,
      timeZone: "Europe/Vienna",
    },
    colorId: "9",
  };

  console.log("Updating calendar event:", booking.google_calendar_event_id);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${booking.google_calendar_event_id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to update event:", error);
    throw new Error(`Failed to update calendar event: ${error}`);
  }

  console.log("Event updated successfully");
}

// Delete Google Calendar event
async function deleteCalendarEvent(eventId: string, accessToken: string): Promise<void> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID not configured");
  }

  console.log("Deleting calendar event:", eventId);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // 410 Gone is also acceptable (event already deleted)
  if (!response.ok && response.status !== 410) {
    const error = await response.text();
    console.error("Failed to delete event:", error);
    throw new Error(`Failed to delete calendar event: ${error}`);
  }

  console.log("Event deleted successfully");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, booking } = await req.json() as SyncRequest;
    
    console.log(`Google Calendar Sync: ${action} for booking ${booking.id}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Initialize Supabase client for updating the booking
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result: { success: boolean; eventId?: string; message?: string };

    switch (action) {
      case "create": {
        const eventId = await createCalendarEvent(booking, accessToken);
        
        // Save event ID to booking
        const { error } = await supabase
          .from("bookings")
          .update({ google_calendar_event_id: eventId })
          .eq("id", booking.id);
        
        if (error) {
          console.error("Failed to save event ID:", error);
        }
        
        result = { success: true, eventId, message: "Termin im Google Kalender erstellt" };
        break;
      }
      
      case "update": {
        if (!booking.google_calendar_event_id) {
          // No existing event, create new one
          const eventId = await createCalendarEvent(booking, accessToken);
          
          const { error } = await supabase
            .from("bookings")
            .update({ google_calendar_event_id: eventId })
            .eq("id", booking.id);
          
          if (error) {
            console.error("Failed to save event ID:", error);
          }
          
          result = { success: true, eventId, message: "Termin im Google Kalender erstellt" };
        } else {
          await updateCalendarEvent(booking, accessToken);
          result = { success: true, eventId: booking.google_calendar_event_id, message: "Termin im Google Kalender aktualisiert" };
        }
        break;
      }
      
      case "delete": {
        if (booking.google_calendar_event_id) {
          await deleteCalendarEvent(booking.google_calendar_event_id, accessToken);
          
          // Clear event ID from booking
          const { error } = await supabase
            .from("bookings")
            .update({ google_calendar_event_id: null })
            .eq("id", booking.id);
          
          if (error) {
            console.error("Failed to clear event ID:", error);
          }
        }
        result = { success: true, message: "Termin aus Google Kalender entfernt" };
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Google Calendar Sync error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
