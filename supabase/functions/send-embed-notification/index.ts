import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmbedNotificationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventDate: string;
  eventType: string;
  serviceName: string;
  venue?: string;
  eventTime?: string;
  duration?: number;
  message?: string;
  referralSources?: string[];
  customerType?: string;
  companyName?: string;
  companyStreet?: string;
  companyZip?: string;
  companyCity?: string;
  companyCountry?: string;
}

const safeValue = (val: any, fallback: string = '-'): string => {
  if (val === undefined || val === null || val === '') return fallback;
  return String(val);
};

const getSmtpClient = () => {
  return new SMTPClient({
    connection: {
      hostname: "smtp.strato.de",
      port: 465,
      tls: true,
      auth: {
        username: "buchung@pixelpalast.at",
        password: Deno.env.get("STRATO_SMTP_PASSWORD") || "",
      },
    },
  });
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const client = getSmtpClient();
  try {
    await client.send({
      from: "PixelPalast <buchung@pixelpalast.at>",
      to: to,
      subject: subject,
      mimeContent: [
        {
          mimeType: "text/html; charset=utf-8",
          content: html,
          transferEncoding: "quoted-printable",
        },
      ],
    });
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  } finally {
    await client.close();
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EmbedNotificationRequest = await req.json();
    console.log("Received embed notification request:", data);

    const adminEmail = "buchung@pixelpalast.at";

    // Format date for display
    const formattedDate = data.eventDate ? new Date(data.eventDate).toLocaleDateString('de-AT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '-';

    // Email to admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
          📩 Neue Anfrage über Embed-Formular
        </h1>
        
        <h2 style="color: #333;">Event-Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Datum:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formattedDate}</td>
          </tr>
          ${data.eventTime ? `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Uhrzeit:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(data.eventTime)} Uhr</td>
          </tr>
          ` : ''}
          ${data.duration ? `
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Dauer:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.duration} Stunden</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Event-Art:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(data.eventType)}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Gewünschte Leistung:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(data.serviceName)}</td>
          </tr>
          ${data.venue ? `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Veranstaltungsort:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(data.venue)}</td>
          </tr>
          ` : ''}
        </table>
        
        <h2 style="color: #333; margin-top: 20px;">Kontaktdaten</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Kundentyp:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.customerType === 'firma' ? 'Firmenkunde' : 'Privatkunde'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(data.customerName)}</td>
          </tr>
          ${data.companyName ? `
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Firma:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${safeValue(data.companyName)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>E-Mail:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${safeValue(data.customerEmail)}">${safeValue(data.customerEmail)}</a></td>
          </tr>
          ${data.customerPhone ? `
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Telefon:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td>
          </tr>
          ` : ''}
          ${data.companyStreet ? `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Adresse:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              ${safeValue(data.companyStreet)}<br>
              ${safeValue(data.companyZip)} ${safeValue(data.companyCity)}<br>
              ${safeValue(data.companyCountry)}
            </td>
          </tr>
          ` : ''}
        </table>
        
        ${data.message ? `
        <h2 style="color: #333; margin-top: 20px;">Nachricht</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #D4AF37;">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
        ` : ''}
        
        ${data.referralSources && data.referralSources.length > 0 ? `
        <h2 style="color: #333; margin-top: 20px;">Wie hat der Kunde uns gefunden?</h2>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px;">
          ${data.referralSources.join(', ')}
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
          <strong>💡 Nächste Schritte:</strong><br>
          Diese Anfrage wurde automatisch in den Buchungen gespeichert. Bitte kontaktieren Sie den Kunden zeitnah.
        </div>
        
        <p style="color: #666; margin-top: 30px; font-size: 12px;">
          Diese E-Mail wurde automatisch über das Embed-Kontaktformular gesendet.
        </p>
      </div>
    `;

    await sendEmail(adminEmail, `📩 Neue Embed-Anfrage: ${data.serviceName} - ${data.customerName}`, adminHtml);
    console.log("Admin notification email sent");

    // Confirmation email to customer
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Vielen Dank für Ihre Anfrage!</h1>
        
        <p>Hallo ${safeValue(data.customerName)},</p>
        
        <p>wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.</p>
        
        <h2 style="color: #333; margin-top: 20px;">Ihre Anfrage im Überblick</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
          <p><strong>Datum:</strong> ${formattedDate}</p>
          ${data.eventTime ? `<p><strong>Uhrzeit:</strong> ${safeValue(data.eventTime)} Uhr</p>` : ''}
          ${data.duration ? `<p><strong>Dauer:</strong> ${data.duration} Stunden</p>` : ''}
          <p><strong>Event-Art:</strong> ${safeValue(data.eventType)}</p>
          <p><strong>Gewünschte Leistung:</strong> ${safeValue(data.serviceName)}</p>
          ${data.venue ? `<p><strong>Veranstaltungsort:</strong> ${safeValue(data.venue)}</p>` : ''}
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
    `;

    let customerEmailSent = true;
    try {
      await sendEmail(data.customerEmail, "Ihre Anfrage bei PixelPalast - Wir melden uns!", customerHtml);
      console.log("Customer confirmation email sent");
    } catch (error) {
      console.warn("Customer email failed:", error);
      customerEmailSent = false;
    }

    return new Response(JSON.stringify({ success: true, customerEmailSent }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-embed-notification function:", error);
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
