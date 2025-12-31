import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  date: string;
  dateRaw: string;
  eventType: string;
  timeFrom?: string;
  timeTo?: string;
  timeInfo?: string;
  hours?: number;
  service: string;
  packageName: string;
  packageDuration?: string;
  packagePrice: string;
  packagePriceNum: number;
  basePrice?: number;
  hourlyRate?: number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  adminEmail?: string;
  // Billing address fields
  billingCompany?: string;
  billingName?: string;
  billingStreet?: string;
  billingZip?: string;
  billingCity?: string;
  billingCountry?: string;
  billingVatId?: string;
}

// Helper to safely display values (avoid undefined/null appearing in email)
const safeValue = (val: any, fallback: string = '-'): string => {
  if (val === undefined || val === null || val === '') return fallback;
  return String(val);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingRequest = await req.json();
    console.log("Received booking request:", booking);

    const adminEmail = booking.adminEmail || "buchung@pixelpalast.at";
    const fromEmail = adminEmail;

    // Save booking to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("bookings")
      .insert({
        date: booking.dateRaw,
        event_type: booking.eventType,
        service_name: booking.service,
        package_name: booking.packageName,
        package_price: booking.packagePriceNum || 0,
        customer_name: booking.name,
        customer_email: booking.email,
        customer_phone: booking.phone || null,
        message: booking.message || null,
        status: "pending",
        // Billing address fields
        billing_company: booking.billingCompany || null,
        billing_name: booking.billingName || null,
        billing_street: booking.billingStreet || null,
        billing_zip: booking.billingZip || null,
        billing_city: booking.billingCity || null,
        billing_country: booking.billingCountry || null,
        billing_vat_id: booking.billingVatId || null,
      });

    if (dbError) {
      console.error("Error saving booking to database:", dbError);
    } else {
      console.log("Booking saved to database");
    }

    // Email to admin
    const adminEmailResponse = await resend.emails.send({
      // Keep resend.dev sender for now to avoid breaking admin notifications while domain verification is pending
      from: "PixelPalast Buchungen <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Neue Buchungsanfrage: ${booking.service} - ${booking.eventType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
            Neue Buchungsanfrage
          </h1>
          
          <h2 style="color: #333;">Event-Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Datum:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(booking.date)}</td>
            </tr>
            ${booking.timeInfo ? `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Uhrzeit:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(booking.timeInfo)}</td>
            </tr>
            ` : ''}
            ${booking.hours ? `
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Dauer:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${booking.hours} Stunden</td>
            </tr>
            ` : ''}
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Event-Art:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(booking.eventType)}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Service:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(booking.service)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Paket:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(booking.packageName)}${booking.packageDuration ? ` (${booking.packageDuration})` : ''}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Preis:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #D4AF37; font-weight: bold;">${safeValue(booking.packagePrice)}</td>
            </tr>
            ${booking.basePrice && booking.hourlyRate && booking.hours ? `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Preisberechnung:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">€${booking.basePrice} Grundpreis + ${booking.hours}h × €${booking.hourlyRate}/Std</td>
            </tr>
            ` : ''}
          </table>
          
          <h2 style="color: #333; margin-top: 20px;">Kontaktdaten</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(booking.name)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>E-Mail:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${safeValue(booking.email)}">${safeValue(booking.email)}</a></td>
            </tr>
            ${booking.phone ? `
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Telefon:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${booking.phone}">${booking.phone}</a></td>
            </tr>
            ` : ''}
          </table>
          
          ${booking.message ? `
          <h2 style="color: #333; margin-top: 20px;">Nachricht</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #D4AF37;">
            ${booking.message}
          </div>
          ` : ''}
          
          <p style="color: #666; margin-top: 30px; font-size: 12px;">
            Diese E-Mail wurde automatisch über das Buchungsformular auf pixelpalast.at gesendet.
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Confirmation email to customer (requires verified domain at Resend)
    const customerEmailResponse = await resend.emails.send({
      from: `PixelPalast <${fromEmail}>`,
      to: [booking.email],
      subject: "Ihre Buchungsanfrage bei PixelPalast",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">Vielen Dank für Ihre Anfrage!</h1>
          
          <p>Hallo ${safeValue(booking.name)},</p>
          
          <p>wir haben Ihre Buchungsanfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.</p>
          
          <h2 style="color: #333; margin-top: 20px;">Ihre Buchungsdetails</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <p><strong>Datum:</strong> ${safeValue(booking.date)}</p>
            ${booking.timeInfo ? `<p><strong>Uhrzeit:</strong> ${safeValue(booking.timeInfo)}</p>` : ''}
            ${booking.hours ? `<p><strong>Dauer:</strong> ${booking.hours} Stunden</p>` : ''}
            <p><strong>Event-Art:</strong> ${safeValue(booking.eventType)}</p>
            <p><strong>Service:</strong> ${safeValue(booking.service)}</p>
            <p><strong>Paket:</strong> ${safeValue(booking.packageName)}${booking.packageDuration ? ` (${booking.packageDuration})` : ''}</p>
            <p style="color: #D4AF37; font-size: 20px;"><strong>Preis:</strong> ${safeValue(booking.packagePrice)}</p>
          </div>
          
          <p style="margin-top: 20px;">
            Bei Fragen können Sie uns jederzeit kontaktieren.
          </p>
          
          <p>Mit freundlichen Grüßen,<br>
          <strong>Ihr PixelPalast Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            PixelPalast - Photo Booth & 360° Video Booth<br>
            <a href="https://pixelpalast.at" style="color: #D4AF37;">www.pixelpalast.at</a>
          </p>
        </div>
      `,
    });

    const customerEmailSent = !customerEmailResponse?.error;
    if (!customerEmailSent) {
      console.warn("Customer email failed:", customerEmailResponse?.error);
    }

    return new Response(JSON.stringify({ success: true, customerEmailSent }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
