import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

async function generateInvoicePdf(invoice: InvoiceRow): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  let y = height - margin;

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

  // Spacing below header
  y -= 60;

  // Title
  y -= 48;
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

  // Totals
  const totalsX = tableX + colDesc;
  const netTotal = items.reduce((s, i) => s + i.amount, 0);
  const vatRate = safeNum(invoice.vat_rate);
  const vatAmount = vatRate > 0 ? safeNum(invoice.vat_amount, netTotal * (vatRate / 100)) : 0;
  const grossTotal = netTotal + vatAmount;

  page.drawText("Nettobetrag:", { x: totalsX, y, size: 10, font });
  page.drawText(formatCurrency(netTotal), { x: totalsX + colQty, y, size: 10, font: fontBold });
  y -= 14;
  if (vatRate > 0) {
    page.drawText(`USt. ${vatRate}%:`, { x: totalsX, y, size: 10, font });
    page.drawText(formatCurrency(vatAmount), { x: totalsX + colQty, y, size: 10, font: fontBold });
    y -= 14;
  }
  page.drawText("Gesamtbetrag:", { x: totalsX, y, size: 11, font: fontBold });
  page.drawText(formatCurrency(grossTotal), { x: totalsX + colQty, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
  y -= 24;

  // Deposit info
  const deposit = safeNum(invoice.deposit_amount);
  const remaining = safeNum(invoice.remaining_amount);
  if (deposit > 0) {
    page.drawText("Anzahlung:", { x: totalsX, y, size: 10, font });
    page.drawText(formatCurrency(deposit), { x: totalsX + colQty, y, size: 10, font: fontBold });
    y -= 14;
    if (remaining > 0) {
      page.drawText("Restbetrag:", { x: totalsX, y, size: 10, font });
      page.drawText(formatCurrency(remaining), { x: totalsX + colQty, y, size: 10, font: fontBold });
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
    const pdfBytes = await generateInvoicePdf(invoice as InvoiceRow);
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

    // Send email with attachment (using resend.dev until domain is verified)
    const emailResponse = await resend.emails.send({
      from: "PixelPalast <onboarding@resend.dev>",
      to: [invoice.customer_email],
      subject: `Ihre Rechnung ${invoice.invoice_number} von PixelPalast`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">Ihre Rechnung</h1>
          
          <p>Guten Tag ${invoice.customer_name},</p>
          
          <p>anbei erhalten Sie Ihre Rechnung <strong>${invoice.invoice_number}</strong> für unsere Leistungen.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Rechnungsnummer:</strong> ${invoice.invoice_number}</p>
            <p><strong>Rechnungsdatum:</strong> ${formatDate(invoice.invoice_date)}</p>
            <p><strong>Gesamtbetrag:</strong> <span style="color: #D4AF37; font-size: 18px;">${formatCurrency(safeNum(invoice.gross_amount))}</span></p>
          </div>
          
          <p>Die Rechnung finden Sie im PDF-Anhang dieser E-Mail.</p>
          
          <p><strong>Zahlungsziel:</strong> 14 Tage nach Rechnungsdatum</p>
          
          <p style="margin-top: 30px;">
            Bei Fragen zu Ihrer Rechnung stehen wir Ihnen gerne zur Verfügung.
          </p>
          
          <p>Mit freundlichen Grüßen,<br>
          <strong>Ihr PixelPalast Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            PixelPalast - Photo Booth & 360° Video Booth<br>
            Marcel Fischer | Wildstraße 5 | 2100 Korneuburg<br>
            <a href="https://pixelpalast.at" style="color: #D4AF37;">www.pixelpalast.at</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Rechnung_${invoice.invoice_number}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (emailResponse.error) {
      console.error("Email error:", emailResponse.error);
      throw new Error("E-Mail konnte nicht gesendet werden: " + emailResponse.error.message);
    }

    console.log("Invoice email sent successfully:", emailResponse);

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
