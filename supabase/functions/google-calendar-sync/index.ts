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

interface CalendarEventData {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  end_time?: string;
  color?: string;
  is_all_day?: boolean;
  location?: string;
  google_calendar_event_id?: string;
}

interface SyncRequest {
  action: "create" | "update" | "delete" | "import";
  type: "booking" | "calendar_event";
  booking?: BookingData;
  calendarEvent?: CalendarEventData;
  importOptions?: {
    timeMin?: string;
    timeMax?: string;
  };
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  colorId?: string;
  status?: string;
}

// Get access token using service account credentials
async function getAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  
  if (!email || !privateKey) {
    throw new Error("Google Service Account credentials not configured");
  }

  // The secret is sometimes pasted as the entire JSON key file instead of just the PEM.
  // We normalize it here to avoid crypto import errors.
  const normalizePrivateKeyPem = (raw: string): string => {
    let key = raw.trim();

    // If a user pasted the full JSON, extract private_key.
    if (key.startsWith("{") || key.includes('"private_key"')) {
      try {
        const parsed = JSON.parse(key);
        if (typeof parsed?.private_key === "string") {
          key = parsed.private_key;
        }
      } catch {
        // ignore; we'll validate below
      }
    }

    // Convert literal \n sequences into real newlines
    key = key.replace(/\\n/g, "\n").trim();

    // We only support PKCS8 keys (Google service accounts provide this)
    if (key.includes("BEGIN RSA PRIVATE KEY")) {
      throw new Error(
        "Ungültiger Private Key: PKCS#1 erkannt (BEGIN RSA PRIVATE KEY). Bitte den Wert aus dem JSON Feld 'private_key' verwenden (BEGIN PRIVATE KEY)."
      );
    }

    if (!key.includes("BEGIN PRIVATE KEY") || !key.includes("END PRIVATE KEY")) {
      // Avoid logging the key, but provide actionable hints.
      const looksLikeJson = key.startsWith("{") || key.includes('"type"') || key.includes('"client_email"');
      throw new Error(
        `Ungültiger Private Key. Erwartet wird ein PEM im Format '-----BEGIN PRIVATE KEY-----'. ${looksLikeJson ? "Es sieht so aus, als wäre der komplette JSON-Key eingefügt worden." : ""}`
      );
    }

    return key;
  };

  const pemToPkcs8Der = (pem: string): ArrayBuffer => {
    const base64 = pem
      .replace(/-----BEGIN [^-]+-----/g, "")
      .replace(/-----END [^-]+-----/g, "")
      .replace(/\s+/g, "")
      .trim();

    // base64 decoding (DER)
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

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
  const normalizedPem = normalizePrivateKeyPem(privateKey);
  const binaryKey = pemToPkcs8Der(normalizedPem);

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );
  } catch (e) {
    // Provide a more helpful message than the raw ASN.1 error.
    console.error("Private key import failed (sanitized):", {
      hasBegin: normalizedPem.includes("BEGIN PRIVATE KEY"),
      hasEnd: normalizedPem.includes("END PRIVATE KEY"),
      derLength: binaryKey ? new Uint8Array(binaryKey).byteLength : undefined,
      error: e instanceof Error ? e.message : String(e),
    });
    throw new Error(
      "Private Key konnte nicht gelesen werden. Bitte prüfe, dass wirklich der PEM-Block aus 'private_key' (inkl. BEGIN/END) eingefügt wurde und keine zusätzlichen Zeichen/Anführungszeichen enthalten sind."
    );
  }

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
function formatEventTime(date: string, time?: string, durationHours?: number, endTime?: string): { start: string; end: string } {
  const eventDate = new Date(date);
  
  if (time) {
    const [hours, minutes] = time.split(":").map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    eventDate.setHours(10, 0, 0, 0); // Default to 10:00
  }
  
  let endDate: Date;
  if (endTime) {
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    endDate = new Date(date);
    endDate.setHours(endHours, endMinutes, 0, 0);
  } else {
    const duration = durationHours || 3; // Default 3 hours
    endDate = new Date(eventDate.getTime() + duration * 60 * 60 * 1000);
  }
  
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

// Map color hex to Google Calendar colorId
function getColorId(hexColor?: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': '9',  // Blue
    '#22c55e': '10', // Green
    '#ef4444': '11', // Red
    '#f97316': '6',  // Orange
    '#a855f7': '3',  // Purple
    '#ec4899': '5',  // Pink
    '#14b8a6': '7',  // Teal
    '#eab308': '5',  // Yellow
  };
  return colorMap[hexColor || '#3b82f6'] || '9';
}

// Map Google Calendar colorId to hex color
function getHexColor(colorId?: string): string {
  const colorMap: Record<string, string> = {
    '1': '#a4bdfc', // Lavender -> Blue
    '2': '#7ae7bf', // Sage -> Green
    '3': '#a855f7', // Purple
    '4': '#ff887c', // Flamingo -> Pink/Red
    '5': '#ec4899', // Pink
    '6': '#f97316', // Orange
    '7': '#14b8a6', // Teal
    '8': '#e1e1e1', // Gray
    '9': '#3b82f6', // Blue
    '10': '#22c55e', // Green
    '11': '#ef4444', // Red
  };
  return colorMap[colorId || '9'] || '#3b82f6';
}

// Determine shift type based on title and time
// "Tag" = Day shift (Blue), "Nacht" = Night shift (Red)
function determineShiftColor(title?: string, startTime?: string): string {
  if (!title) return '#3b82f6'; // Default blue
  
  const lowerTitle = title.toLowerCase();
  
  // Check title first - "Nacht" is always red, "Tag" is always blue
  if (lowerTitle === 'nacht' || lowerTitle.includes('nachtschicht')) {
    return '#ef4444'; // Red for night shift
  }
  if (lowerTitle === 'tag' || lowerTitle.includes('tagschicht')) {
    return '#3b82f6'; // Blue for day shift
  }
  
  // Fallback to time-based detection
  if (startTime) {
    const [hours] = startTime.split(':').map(Number);
    // Night shift: 18:00-06:00 -> Red
    if (hours >= 18 || hours < 6) {
      return '#ef4444'; // Red for night shift
    }
  }
  
  return '#3b82f6'; // Default blue for day shift
}

// Check if an event looks like a shift (based on title patterns)
function isShiftEvent(summary?: string): boolean {
  if (!summary) return false;
  const lowerSummary = summary.toLowerCase().trim();
  return (
    lowerSummary === 'tag' ||
    lowerSummary === 'nacht' ||
    lowerSummary.includes('schicht') ||
    lowerSummary.includes('shift') ||
    lowerSummary.includes('dienst') ||
    lowerSummary.includes('arbeit') ||
    /^[a-z]+\s+\d{1,2}:\d{2}/.test(lowerSummary) // Pattern like "Name 08:00"
  );
}

// Create Google Calendar event for a booking
async function createBookingEvent(booking: BookingData, accessToken: string): Promise<string> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID not configured");
  }

  console.log("Using calendar ID:", calendarId);

  const { start, end } = formatEventTime(booking.date, booking.event_time, booking.duration_hours);
  
  const staffInfo = booking.assigned_staff?.length 
    ? `\n\n👥 Zugewiesene Mitarbeiter:\n${booking.assigned_staff.join(", ")}`
    : "";
  
  const event = {
    summary: `📸 ${booking.customer_name} - ${booking.event_type}`,
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
    colorId: "9", // Blue for bookings
  };

  console.log("Creating booking event:", event.summary);

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
  console.log("Booking event created successfully:", createdEvent.id);
  return createdEvent.id;
}

// Create Google Calendar event for a manual calendar entry
async function createManualEvent(calendarEvent: CalendarEventData, accessToken: string): Promise<string> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID not configured");
  }

  const { start, end } = formatEventTime(
    calendarEvent.event_date, 
    calendarEvent.event_time, 
    undefined,
    calendarEvent.end_time
  );
  
  const event = {
    summary: `📅 ${calendarEvent.title}`,
    description: calendarEvent.description || "",
    location: calendarEvent.location || "",
    start: calendarEvent.is_all_day 
      ? { date: calendarEvent.event_date, timeZone: "Europe/Vienna" }
      : { dateTime: start, timeZone: "Europe/Vienna" },
    end: calendarEvent.is_all_day 
      ? { date: calendarEvent.event_date, timeZone: "Europe/Vienna" }
      : { dateTime: end, timeZone: "Europe/Vienna" },
    colorId: getColorId(calendarEvent.color),
  };

  console.log("Creating manual event:", event.summary);

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
  console.log("Manual event created successfully:", createdEvent.id);
  return createdEvent.id;
}

// Update Google Calendar event for a booking
async function updateBookingEvent(booking: BookingData, accessToken: string): Promise<void> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId || !booking.google_calendar_event_id) {
    throw new Error("Calendar ID or Event ID not available");
  }

  const { start, end } = formatEventTime(booking.date, booking.event_time, booking.duration_hours);
  
  const staffInfo = booking.assigned_staff?.length 
    ? `\n\n👥 Zugewiesene Mitarbeiter:\n${booking.assigned_staff.join(", ")}`
    : "";
  
  const event = {
    summary: `📸 ${booking.customer_name} - ${booking.event_type}`,
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

  console.log("Updating booking event:", booking.google_calendar_event_id);

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

  console.log("Booking event updated successfully");
}

// Update Google Calendar event for a manual entry
async function updateManualEvent(calendarEvent: CalendarEventData, accessToken: string): Promise<void> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId || !calendarEvent.google_calendar_event_id) {
    throw new Error("Calendar ID or Event ID not available");
  }

  const { start, end } = formatEventTime(
    calendarEvent.event_date, 
    calendarEvent.event_time, 
    undefined,
    calendarEvent.end_time
  );
  
  const event = {
    summary: `📅 ${calendarEvent.title}`,
    description: calendarEvent.description || "",
    location: calendarEvent.location || "",
    start: calendarEvent.is_all_day 
      ? { date: calendarEvent.event_date, timeZone: "Europe/Vienna" }
      : { dateTime: start, timeZone: "Europe/Vienna" },
    end: calendarEvent.is_all_day 
      ? { date: calendarEvent.event_date, timeZone: "Europe/Vienna" }
      : { dateTime: end, timeZone: "Europe/Vienna" },
    colorId: getColorId(calendarEvent.color),
  };

  console.log("Updating manual event:", calendarEvent.google_calendar_event_id);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${calendarEvent.google_calendar_event_id}`,
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

  console.log("Manual event updated successfully");
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

// Fetch events from Google Calendar for import
async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID not configured");
  }

  // Default to fetching events from 1 year ago to 5 years ahead
  const now = new Date();
  const defaultTimeMin = timeMin || new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString();
  const defaultTimeMax = timeMax || new Date(now.getFullYear() + 5, now.getMonth(), 1).toISOString();

  console.log(`Fetching Google Calendar events from ${defaultTimeMin} to ${defaultTimeMax}`);

  const params = new URLSearchParams({
    timeMin: defaultTimeMin,
    timeMax: defaultTimeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '500',
  });

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch events:", error);
    throw new Error(`Failed to fetch calendar events: ${error}`);
  }

  const data = await response.json();
  console.log(`Fetched ${data.items?.length || 0} events from Google Calendar`);
  
  return data.items || [];
}

// Import events from Google Calendar to local database
async function importGoogleCalendarEvents(
  accessToken: string,
  supabaseUrl: string,
  supabaseKey: string,
  timeMin?: string,
  timeMax?: string
): Promise<{ imported: number; updated: number; skipped: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const googleEvents = await fetchGoogleCalendarEvents(accessToken, timeMin, timeMax);
  
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  // Get existing events that have a Google Calendar event ID
  const { data: existingEvents } = await supabase
    .from('calendar_events')
    .select('id, google_calendar_event_id');

  const existingGoogleIds = new Set<string>();
  const existingEventsMap = new Map<string, string>();
  
  if (existingEvents) {
    for (const e of existingEvents) {
      if (e.google_calendar_event_id) {
        existingGoogleIds.add(e.google_calendar_event_id);
        existingEventsMap.set(e.google_calendar_event_id, e.id);
      }
    }
  }

  // Also check bookings for Google Calendar IDs to avoid duplicates
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('id, google_calendar_event_id');

  const bookingGoogleIds = new Set<string>();
  if (existingBookings) {
    for (const b of existingBookings) {
      if (b.google_calendar_event_id) {
        bookingGoogleIds.add(b.google_calendar_event_id);
      }
    }
  }

  for (const gEvent of googleEvents) {
    try {
      // Skip cancelled events
      if (gEvent.status === 'cancelled') {
        skipped++;
        continue;
      }

      // Skip if this event originated from our app (check for app-specific markers)
      if (gEvent.summary?.startsWith('📸') || gEvent.summary?.startsWith('📅')) {
        skipped++;
        continue;
      }

      // Skip if already linked to a booking
      if (bookingGoogleIds.has(gEvent.id)) {
        skipped++;
        continue;
      }

      // Parse date/time
      let eventDate: string;
      let eventTime: string | null = null;
      let endTime: string | null = null;
      let isAllDay = false;

      if (gEvent.start?.date) {
        // All-day event
        eventDate = gEvent.start.date;
        isAllDay = true;
      } else if (gEvent.start?.dateTime) {
        const startDt = new Date(gEvent.start.dateTime);
        eventDate = startDt.toISOString().split('T')[0];
        eventTime = startDt.toTimeString().slice(0, 5);

        if (gEvent.end?.dateTime) {
          const endDt = new Date(gEvent.end.dateTime);
          endTime = endDt.toTimeString().slice(0, 5);
        }
      } else {
        // Skip events without proper date
        skipped++;
        continue;
      }

      // Determine if this is a shift and assign appropriate color
      const isShift = isShiftEvent(gEvent.summary);
      const color = isShift 
        ? determineShiftColor(gEvent.summary, eventTime || undefined) 
        : getHexColor(gEvent.colorId);

      const eventData = {
        title: (gEvent.summary || 'Importierter Termin').replace(/^(📸|📅)\s*/, ''),
        description: gEvent.description || null,
        event_date: eventDate,
        event_time: eventTime,
        end_time: endTime,
        color: color,
        is_all_day: isAllDay,
        location: gEvent.location || null,
        event_type: isShift ? 'shift' : 'imported',
        google_calendar_event_id: gEvent.id,
      };

      // Check if event already exists
      if (existingGoogleIds.has(gEvent.id)) {
        // Update existing event
        const existingEventId = existingEventsMap.get(gEvent.id);
        if (existingEventId) {
          const { error } = await supabase
            .from('calendar_events')
            .update(eventData)
            .eq('id', existingEventId);

          if (error) {
            console.error(`Failed to update event ${gEvent.id}:`, error);
            skipped++;
          } else {
            updated++;
          }
        }
      } else {
        // Create new event
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventData);

        if (error) {
          console.error(`Failed to import event ${gEvent.id}:`, error);
          skipped++;
        } else {
          imported++;
        }
      }
    } catch (error) {
      console.error(`Error processing event ${gEvent.id}:`, error);
      skipped++;
    }
  }

  console.log(`Import complete: ${imported} imported, ${updated} updated, ${skipped} skipped`);
  return { imported, updated, skipped };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, type, booking, calendarEvent, importOptions } = await req.json() as SyncRequest;
    
    // Handle legacy requests (without type field)
    const eventType = type || "booking";
    
    console.log(`Google Calendar Sync: ${action} for ${eventType}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result: { success: boolean; eventId?: string; message?: string; imported?: number; updated?: number; skipped?: number };

    // Handle import action
    if (action === "import") {
      const importResult = await importGoogleCalendarEvents(
        accessToken,
        supabaseUrl,
        supabaseKey,
        importOptions?.timeMin,
        importOptions?.timeMax
      );
      
      result = {
        success: true,
        message: `${importResult.imported} importiert, ${importResult.updated} aktualisiert, ${importResult.skipped} übersprungen`,
        ...importResult
      };
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (eventType === "booking" && booking) {
      // Handle booking sync
      switch (action) {
        case "create": {
          const eventId = await createBookingEvent(booking, accessToken);
          
          const { error } = await supabase
            .from("bookings")
            .update({ google_calendar_event_id: eventId })
            .eq("id", booking.id);
          
          if (error) {
            console.error("Failed to save event ID:", error);
          }
          
          result = { success: true, eventId, message: "Buchung im Google Kalender erstellt" };
          break;
        }
        
        case "update": {
          if (!booking.google_calendar_event_id) {
            const eventId = await createBookingEvent(booking, accessToken);
            
            const { error } = await supabase
              .from("bookings")
              .update({ google_calendar_event_id: eventId })
              .eq("id", booking.id);
            
            if (error) {
              console.error("Failed to save event ID:", error);
            }
            
            result = { success: true, eventId, message: "Buchung im Google Kalender erstellt" };
          } else {
            await updateBookingEvent(booking, accessToken);
            result = { success: true, eventId: booking.google_calendar_event_id, message: "Buchung im Google Kalender aktualisiert" };
          }
          break;
        }
        
        case "delete": {
          if (booking.google_calendar_event_id) {
            await deleteCalendarEvent(booking.google_calendar_event_id, accessToken);
            
            const { error } = await supabase
              .from("bookings")
              .update({ google_calendar_event_id: null })
              .eq("id", booking.id);
            
            if (error) {
              console.error("Failed to clear event ID:", error);
            }
          }
          result = { success: true, message: "Buchung aus Google Kalender entfernt" };
          break;
        }
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } else if (eventType === "calendar_event" && calendarEvent) {
      // Handle manual calendar event sync
      switch (action) {
        case "create": {
          const eventId = await createManualEvent(calendarEvent, accessToken);
          
          const { error } = await supabase
            .from("calendar_events")
            .update({ google_calendar_event_id: eventId })
            .eq("id", calendarEvent.id);
          
          if (error) {
            console.error("Failed to save event ID:", error);
          }
          
          result = { success: true, eventId, message: "Termin im Google Kalender erstellt" };
          break;
        }
        
        case "update": {
          if (!calendarEvent.google_calendar_event_id) {
            const eventId = await createManualEvent(calendarEvent, accessToken);
            
            const { error } = await supabase
              .from("calendar_events")
              .update({ google_calendar_event_id: eventId })
              .eq("id", calendarEvent.id);
            
            if (error) {
              console.error("Failed to save event ID:", error);
            }
            
            result = { success: true, eventId, message: "Termin im Google Kalender erstellt" };
          } else {
            await updateManualEvent(calendarEvent, accessToken);
            result = { success: true, eventId: calendarEvent.google_calendar_event_id, message: "Termin im Google Kalender aktualisiert" };
          }
          break;
        }
        
        case "delete": {
          if (calendarEvent.google_calendar_event_id) {
            await deleteCalendarEvent(calendarEvent.google_calendar_event_id, accessToken);
            
            const { error } = await supabase
              .from("calendar_events")
              .update({ google_calendar_event_id: null })
              .eq("id", calendarEvent.id);
            
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
    } else {
      throw new Error("Invalid request: missing booking or calendarEvent data");
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
