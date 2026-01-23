import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendAIEmailRequest {
  to: string;
  customerName: string;
  subject?: string;
  content: string;
  type: 'offer' | 'email';
  eventType?: string;
  eventDate?: string;
}

// SMTP configuration for Strato
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

// Convert markdown-like content to HTML
const convertToHtml = (content: string): string => {
  let html = content
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #333; margin-top: 25px; margin-bottom: 12px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color: #D4AF37; margin-bottom: 15px;">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // List items
    .replace(/^- (.+)$/gm, '<li style="margin-bottom: 5px;">$1</li>')
    // Wrap consecutive list items in ul
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin: 10px 0; padding-left: 20px;">$&</ul>')
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin: 15px 0;">')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not starting with HTML tag
  if (!html.startsWith('<')) {
    html = '<p style="margin: 15px 0;">' + html + '</p>';
  }
  
  return html;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, subject, content, type, eventType, eventDate }: SendAIEmailRequest = await req.json();

    if (!to || !content) {
      throw new Error("E-Mail-Adresse und Inhalt sind erforderlich");
    }

    console.log(`Sending AI-generated ${type} to ${to}`);

    // Generate subject line if not provided
    const emailSubject = subject || (type === 'offer' 
      ? `Ihr persönliches Angebot von PixelPalast${eventType ? ` - ${eventType}` : ''}`
      : `Ihre Anfrage bei PixelPalast${eventType ? ` - ${eventType}` : ''}`
    );

    // Convert content to HTML
    const contentHtml = convertToHtml(content);

    // Build the complete email HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">PixelPalast</h1>
              <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">
                ${type === 'offer' ? 'Ihr persönliches Angebot' : 'Antwort auf Ihre Anfrage'}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px; color: #333333; font-size: 15px; line-height: 1.6;">
              ${contentHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 25px 30px; border-top: 1px solid #eeeeee;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #666666; font-size: 13px;">
                    <p style="margin: 0 0 10px 0;"><strong style="color: #D4AF37;">PixelPalast</strong></p>
                    <p style="margin: 0 0 5px 0;">Photo Booth &amp; 360° Video Booth</p>
                    <p style="margin: 0 0 5px 0;">
                      <a href="mailto:buchung@pixelpalast.at" style="color: #D4AF37; text-decoration: none;">buchung@pixelpalast.at</a>
                    </p>
                    <p style="margin: 0;">
                      <a href="https://pixelpalast.at" style="color: #D4AF37; text-decoration: none;">www.pixelpalast.at</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Legal footer -->
        <table width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px; text-align: center; color: #999999; font-size: 11px;">
              Diese E-Mail wurde über das PixelPalast Buchungssystem versendet.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await sendEmail(to, emailSubject, html);

    return new Response(
      JSON.stringify({ success: true, message: `E-Mail an ${to} gesendet` }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error sending AI email:", error);
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
