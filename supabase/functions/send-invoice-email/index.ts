import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceRequest {
  invoiceId: string;
}

type InvoiceRow = {
  id: string;
  booking_id: string | null;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  description: string;
  service_name: string | null;
  net_amount: number;
  gross_amount: number;
  vat_rate: number | null;
  vat_amount: number | null;
  kilometer_rate: number | null;
  kilometers: number | null;
  kilometer_amount: number | null;
  deposit_amount: number | null;
  deposit_due_date: string | null;
  remaining_amount: number | null;
  billing_company: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_vat_id: string | null;
};

const formatCurrency = (amount: number) =>
  amount.toLocaleString("de-AT", { style: "currency", currency: "EUR" });

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const safeNum = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function wrapText(args: { text: string; font: any; fontSize: number; maxWidth: number }): string[] {
  const { text, font, fontSize, maxWidth } = args;
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}

function buildRecipientLines(invoice: InvoiceRow): string[] {
  const lines: string[] = [];
  if (invoice.billing_company) lines.push(invoice.billing_company);
  lines.push(invoice.customer_name);
  if (invoice.billing_street) lines.push(invoice.billing_street);
  const cityLine = [invoice.billing_zip, invoice.billing_city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (invoice.billing_country && invoice.billing_country !== "Österreich") lines.push(invoice.billing_country);
  if (invoice.billing_vat_id) lines.push(`UID: ${invoice.billing_vat_id}`);
  return lines;
}

async function fetchLogoPngBytes(origin: string | null): Promise<Uint8Array | null> {
  const candidates = [origin, "https://pixelpalast.at", "https://www.pixelpalast.at"].filter(Boolean) as string[];

  for (const base of candidates) {
    try {
      const url = new URL("/pixelpalast-logo.png", base);
      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    } catch {
      // try next candidate
    }
  }

  return null;
}

async function generateInvoicePdf(args: { invoice: InvoiceRow; origin: string | null }): Promise<Uint8Array> {
  const { invoice, origin } = args;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  let y = height - margin;
  let logoBottomY = y;

  // Logo (left)
  const logoBytes = await fetchLogoPngBytes(origin);
  if (logoBytes) {
    try {
      const logoImg = await pdfDoc.embedPng(logoBytes);
      const dims = logoImg.scaleToFit(140, 46);
      page.drawImage(logoImg, {
        x: margin,
        y: y - dims.height,
        width: dims.width,
        height: dims.height,
      });
      logoBottomY = y - dims.height;
    } catch {
      // ignore
    }
  } else {
    // Fallback: text logo so the header never looks empty
    page.drawText("PIXELPALAST", { x: margin, y: y - 22, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    logoBottomY = y - 22;
  }

  // Company info (right top)
  const companyX = width - margin - 200;
  const companyLines = [
    { t: "Marcel Fischer", b: true },
    { t: "Wildstraße 5" },
    { t: "2100 Korneuburg" },
    { t: "office@pixelpalast.at" },
    { t: "+43 660 2545493" },
  ];
  let companyY = y - 12;
  for (const line of companyLines) {
    page.drawText(line.t, { x: companyX, y: companyY, size: 10, font: line.b ? fontBold : font, color: rgb(0.15, 0.15, 0.15) });
    companyY -= 14;
  }

  // Layout: ensure title never overlaps logo/company header
  const companyBottomY = companyY + 14;
  const headerBottomY = Math.min(logoBottomY, companyBottomY);
  y = headerBottomY - 40;

  // Title
  page.drawText("RECHNUNG", { x: margin, y, size: 28, font, color: rgb(0, 0, 0) });

  // Recipient block
  y -= 36;
  page.drawText("Empfänger", { x: margin, y, size: 9, font, color: rgb(0.45, 0.45, 0.45) });
  const recipientLines = buildRecipientLines(invoice);
  let rY = y - 16;
  for (const line of recipientLines) {
    page.drawText(line, { x: margin, y: rY, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
    rY -= 14;
  }
  if (invoice.customer_email) {
    page.drawText(invoice.customer_email, { x: margin, y: rY - 2, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
  }

  // Invoice meta (right)
  const metaX = width - margin - 220;
  const metaYTop = y;
  const metaItems = [
    { k: "Rechnungs-Nr.:", v: invoice.invoice_number },
    { k: "Datum:", v: formatDate(invoice.invoice_date || new Date().toISOString()) },
  ];
  let metaY = metaYTop;
  for (const item of metaItems) {
    page.drawText(item.k, { x: metaX, y: metaY, size: 9, font, color: rgb(0.45, 0.45, 0.45) });
    page.drawText(item.v, { x: metaX + 95, y: metaY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    metaY -= 14;
  }

  // Table
  y = Math.min(rY - 40, metaYTop - 80);
  const tableX = margin;
  const tableW = width - margin * 2;
  const colDesc = tableW * 0.62;
  const colQty = tableW * 0.12;
  const colAmt = tableW * 0.26;

  // Header row
  page.drawText("Beschreibung", { x: tableX, y, size: 9, font: fontBold });
  page.drawText("Menge", { x: tableX + colDesc, y, size: 9, font: fontBold });
  page.drawText("Betrag", { x: tableX + colDesc + colQty, y, size: 9, font: fontBold });
  y -= 10;
  page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableW, y }, thickness: 2, color: rgb(0, 0, 0) });
  y -= 18;

  const items: Array<{ title: string; desc: string; qtyLabel: string; amount: number }> = [];
  items.push({ title: invoice.service_name || "Dienstleistung", desc: invoice.description, qtyLabel: "1", amount: safeNum(invoice.net_amount) });

  const km = safeNum(invoice.kilometers);
  const kmAmount = safeNum(invoice.kilometer_amount);
  if (km > 0 && kmAmount > 0) {
    items.push({ title: "Anfahrtskosten", desc: `${km} km × ${formatCurrency(safeNum(invoice.kilometer_rate))}`, qtyLabel: "", amount: kmAmount });
  }

  for (const it of items) {
    page.drawText(it.title, { x: tableX, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 14;
    const descLines = wrapText({ text: it.desc, font, fontSize: 9, maxWidth: colDesc - 10 });
    for (const dl of descLines) {
      page.drawText(dl, { x: tableX, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 12;
    }
    page.drawText(it.qtyLabel, { x: tableX + colDesc, y: y + 12, size: 10, font });
    page.drawText(formatCurrency(it.amount), { x: tableX + colDesc + colQty, y: y + 12, size: 10, font: fontBold });
    y -= 12;
  }

  y -= 10;
  page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableW, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
  y -= 16;

  // Totals (right-aligned values to avoid overlaps)
  const totalsLabelX = tableX + colDesc;
  const totalsValueRight = tableX + tableW;

  const drawRight = (value: string, yPos: number, size: number, fontUsed: any) => {
    const w = fontUsed.widthOfTextAtSize(value, size);
    page.drawText(value, {
      x: totalsValueRight - w,
      y: yPos,
      size,
      font: fontUsed,
      color: rgb(0.1, 0.1, 0.1),
    });
  };

  const netTotal = items.reduce((s, i) => s + i.amount, 0);
  const vatRate = safeNum(invoice.vat_rate);
  const vatAmount = vatRate > 0 ? safeNum(invoice.vat_amount, netTotal * (vatRate / 100)) : 0;
  const grossTotal = netTotal + vatAmount;

  page.drawText("Nettobetrag:", { x: totalsLabelX, y, size: 10, font });
  drawRight(formatCurrency(netTotal), y, 10, fontBold);
  y -= 14;

  if (vatRate > 0) {
    page.drawText(`USt. ${vatRate}%:`, { x: totalsLabelX, y, size: 10, font });
    drawRight(formatCurrency(vatAmount), y, 10, fontBold);
    y -= 14;
  }

  page.drawText("Gesamtbetrag:", { x: totalsLabelX, y, size: 11, font: fontBold });
  drawRight(formatCurrency(grossTotal), y, 11, fontBold);
  y -= 24;

  // Deposit info
  const deposit = safeNum(invoice.deposit_amount);
  const remaining = safeNum(invoice.remaining_amount);
  if (deposit > 0) {
    page.drawText("Anzahlung:", { x: totalsLabelX, y, size: 10, font });
    drawRight(formatCurrency(deposit), y, 10, fontBold);
    y -= 14;

    if (remaining > 0) {
      page.drawText("Restbetrag:", { x: totalsLabelX, y, size: 10, font });
      drawRight(formatCurrency(remaining), y, 10, fontBold);
      y -= 14;
    }
  }

  // Footer
  y = 80;
  const footerLines = [
    "Zahlungsziel: 14 Tage nach Rechnungsdatum",
    "Bankverbindung: IBAN: AT12 3456 7890 1234 5678 | BIC: ABCDEFGH",
    "Vielen Dank für Ihr Vertrauen!",
  ];
  for (const fl of footerLines) {
    page.drawText(fl, { x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
    y -= 12;
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
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

const sendEmailWithAttachment = async (to: string, subject: string, html: string, attachment: { filename: string; content: Uint8Array }) => {
  const client = getSmtpClient();
  try {
    // Encode PDF to base64 for attachment
    const pdfBase64 = base64Encode(attachment.content.buffer as ArrayBuffer);
    
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
      attachments: [
        {
          filename: attachment.filename,
          content: pdfBase64,
          contentType: "application/pdf",
          encoding: "base64",
        },
      ],
    });
    console.log(`Email with attachment sent successfully to ${to}`);
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
    const { invoiceId }: SendInvoiceRequest = await req.json();
    console.log("Sending invoice email for:", invoiceId);

    if (!invoiceId) {
      throw new Error("invoiceId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Rechnung nicht gefunden");
    }

    if (!invoice.customer_email) {
      throw new Error("Keine E-Mail-Adresse für den Kunden hinterlegt");
    }

    // Generate PDF
    const referer = req.headers.get("referer");
    const derivedOrigin = referer ? new URL(referer).origin : null;
    const origin = req.headers.get("origin") ?? derivedOrigin;

    const pdfBytes = await generateInvoicePdf({ invoice: invoice as InvoiceRow, origin });

    // Email HTML - Professional branded template
    const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 2px;">PIXELPALAST</h1>
              <p style="margin: 8px 0 0 0; color: #888888; font-size: 12px; letter-spacing: 1px;">PHOTO BOOTH & 360° VIDEO BOOTH</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Ihre Rechnung</h2>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Guten Tag <strong>${invoice.customer_name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                vielen Dank für Ihr Vertrauen! Anbei erhalten Sie Ihre Rechnung für unsere Leistungen.
              </p>
              
              <!-- Invoice Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%); border-radius: 12px; border-left: 4px solid #D4AF37;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">Rechnungsnummer</span><br>
                          <span style="color: #1a1a1a; font-size: 18px; font-weight: 600;">${invoice.invoice_number}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888888; font-size: 13px;">Rechnungsdatum</span><br>
                          <span style="color: #1a1a1a; font-size: 16px;">${formatDate(invoice.invoice_date)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 8px 0; border-top: 1px solid #e0e0e0; margin-top: 8px;">
                          <span style="color: #888888; font-size: 13px;">Gesamtbetrag</span><br>
                          <span style="color: #D4AF37; font-size: 28px; font-weight: 700;">${formatCurrency(safeNum(invoice.gross_amount))}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- PDF Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td style="background-color: #f8f8f8; border-radius: 8px; padding: 16px; text-align: center;">
                    <span style="color: #666666; font-size: 14px;">📎 Die vollständige Rechnung finden Sie im <strong>PDF-Anhang</strong> dieser E-Mail.</span>
                  </td>
                </tr>
              </table>
              
              <!-- Payment Info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td style="padding: 20px; background-color: #1a1a1a; border-radius: 8px;">
                    <p style="margin: 0; color: #D4AF37; font-size: 14px; font-weight: 600;">💳 Zahlungsziel</p>
                    <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 15px;">14 Tage nach Rechnungsdatum</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #555555; font-size: 15px; line-height: 1.6;">
                Bei Fragen zu Ihrer Rechnung stehen wir Ihnen gerne zur Verfügung.
              </p>
              
              <p style="margin: 24px 0 0 0; color: #333333; font-size: 15px; line-height: 1.6;">
                Mit freundlichen Grüßen,<br>
                <strong style="color: #1a1a1a;">Ihr PixelPalast Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #D4AF37; font-size: 14px; font-weight: 600;">PixelPalast</p>
              <p style="margin: 0 0 16px 0; color: #888888; font-size: 13px;">
                Marcel Fischer | Wildstraße 5 | 2100 Korneuburg
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://pixelpalast.at" style="color: #D4AF37; text-decoration: none; font-size: 13px;">www.pixelpalast.at</a>
                  </td>
                  <td style="color: #555555;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:office@pixelpalast.at" style="color: #888888; text-decoration: none; font-size: 13px;">office@pixelpalast.at</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0 0; color: #555555; font-size: 11px;">
                © ${new Date().getFullYear()} PixelPalast. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email with PDF attachment via Strato SMTP
    await sendEmailWithAttachment(
      invoice.customer_email,
      `Ihre Rechnung ${invoice.invoice_number} von PixelPalast`,
      emailHtml,
      {
        filename: `Rechnung_${invoice.invoice_number}.pdf`,
        content: pdfBytes,
      }
    );

    console.log("Invoice email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
