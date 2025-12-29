import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  date: string;
  eventType: string;
  service: string;
  packageName: string;
  packageDuration: string;
  packagePrice: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  adminEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingRequest = await req.json();
    console.log("Received booking request:", booking);

    const adminEmail = booking.adminEmail || "buchung@pixelpalast.at";
    
    // Email to admin
    const adminEmailResponse = await resend.emails.send({
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
              <td style="padding: 10px; border: 1px solid #ddd;">${booking.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Event-Art:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${booking.eventType}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Service:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${booking.service}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Paket:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${booking.packageName} (${booking.packageDuration})</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Preis:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #D4AF37; font-weight: bold;">${booking.packagePrice}</td>
            </tr>
          </table>
          
          <h2 style="color: #333; margin-top: 20px;">Kontaktdaten</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${booking.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>E-Mail:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${booking.email}">${booking.email}</a></td>
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

    // Confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "PixelPalast <onboarding@resend.dev>",
      to: [booking.email],
      subject: "Ihre Buchungsanfrage bei PixelPalast",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">Vielen Dank für Ihre Anfrage!</h1>
          
          <p>Hallo ${booking.name},</p>
          
          <p>wir haben Ihre Buchungsanfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.</p>
          
          <h2 style="color: #333; margin-top: 20px;">Ihre Buchungsdetails</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <p><strong>Datum:</strong> ${booking.date}</p>
            <p><strong>Event-Art:</strong> ${booking.eventType}</p>
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Paket:</strong> ${booking.packageName} (${booking.packageDuration})</p>
            <p style="color: #D4AF37; font-size: 20px;"><strong>Preis:</strong> ${booking.packagePrice}</p>
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

    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse,
        customerEmail: customerEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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
