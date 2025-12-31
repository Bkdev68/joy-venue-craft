import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "content-disposition, x-invoice-number",
};

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
  // Billing
  billing_company: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_vat_id: string | null;
};

interface GenerateInvoiceRequest {
  invoiceId?: string;
  bookingId?: string;
  /** If true: only create/find the invoice row, return JSON, no PDF */
  createOnly?: boolean;
}

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

function wrapText(args: {
  text: string;
  font: any;
  fontSize: number;
  maxWidth: number;
}): string[] {
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

async function fetchLogoPngBytes(origin: string | null): Promise<Uint8Array | null> {
  if (!origin) return null;
  try {
    const url = new URL("/pixelpalast-logo.png", origin);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

async function createOrLoadInvoice(args: {
  supabase: any;
  invoiceId?: string;
  bookingId?: string;
}): Promise<InvoiceRow> {
  const { supabase, invoiceId, bookingId } = args;

  if (invoiceId) {
    const { data: invoice, error } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
    if (error) throw error;
    return invoice as InvoiceRow;
  }

  if (!bookingId) throw new Error("Either invoiceId or bookingId is required");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();
  if (bookingError) throw bookingError;

  // Check if invoice already exists for this booking
  const { data: existingInvoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existingInvoice) return existingInvoice as InvoiceRow;

  // Generate invoice number
  const { data: invoiceNumber, error: invoiceNumberError } = await supabase.rpc("generate_invoice_number");
  if (invoiceNumberError) throw invoiceNumberError;

  const grossAmount = safeNum(booking.package_price, 0);
  const depositAmount = Math.round(grossAmount / 2);

  const { data: newInvoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      booking_id: bookingId,
      invoice_number: invoiceNumber,
      customer_name: booking.billing_name || booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      description: `${booking.package_name} - ${booking.event_type}`,
      service_name: booking.service_name,
      net_amount: grossAmount,
      gross_amount: grossAmount,
      kilometers: 0,
      kilometer_rate: 1.0,
      kilometer_amount: 0,
      deposit_amount: depositAmount,
      remaining_amount: grossAmount - depositAmount,
      payment_status: "offen",
      // Billing address from booking
      billing_company: booking.billing_company || null,
      billing_street: booking.billing_street || null,
      billing_zip: booking.billing_zip || null,
      billing_city: booking.billing_city || null,
      billing_country: booking.billing_country || null,
      billing_vat_id: booking.billing_vat_id || null,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return newInvoice as InvoiceRow;
}

function buildRecipientLines(invoice: InvoiceRow): string[] {
  const lines: string[] = [];
  if (invoice.billing_company) lines.push(invoice.billing_company);
  lines.push(invoice.customer_name);
  if (invoice.billing_street) lines.push(invoice.billing_street);
  if (invoice.billing_zip || invoice.billing_city) {
    lines.push(`${invoice.billing_zip || ""} ${invoice.billing_city || ""}`.trim());
  }
  if (invoice.billing_country && invoice.billing_country !== "Österreich") {
    lines.push(invoice.billing_country);
  }
  if (invoice.billing_vat_id) lines.push(`UID: ${invoice.billing_vat_id}`);
  return lines.filter(Boolean);
}

async function generateInvoicePdf(args: {
  invoice: InvoiceRow;
  origin: string | null;
}): Promise<Uint8Array> {
  const { invoice, origin } = args;
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = height - margin;
  let logoBottomY = y;

  // Logo
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
  }

  // Company info (right)
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
    page.drawText(line.t, {
      x: companyX,
      y: companyY,
      size: 10,
      font: line.b ? fontBold : font,
      color: rgb(0.15, 0.15, 0.15),
    });
    companyY -= 14;
  }

  // Layout: ensure title never overlaps logo/company header
  const companyBottomY = companyY + 14;
  const headerBottomY = Math.min(logoBottomY, companyBottomY);
  y = headerBottomY - 40;

  // Title
  page.drawText("RECHNUNG", {
    x: margin,
    y,
    size: 28,
    font,
    color: rgb(0, 0, 0),
  });

  // Recipient block (left)
  y -= 36;
  page.drawText("Empfänger", {
    x: margin,
    y,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const recipientLines = buildRecipientLines(invoice);
  let rY = y - 16;
  for (const line of recipientLines) {
    page.drawText(line, {
      x: margin,
      y: rY,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    rY -= 14;
  }
  if (invoice.customer_email) {
    page.drawText(invoice.customer_email, {
      x: margin,
      y: rY - 2,
      size: 10,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
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
    page.drawText(item.k, {
      x: metaX,
      y: metaY,
      size: 9,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
    page.drawText(item.v, {
      x: metaX + 95,
      y: metaY,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
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
  page.drawText("Betrag", {
    x: tableX + colDesc + colQty,
    y,
    size: 9,
    font: fontBold,
  });
  y -= 10;
  page.drawLine({
    start: { x: tableX, y },
    end: { x: tableX + tableW, y },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  y -= 18;

  const items: Array<{ title: string; desc: string; qtyLabel: string; amount: number }> = [];
  items.push({
    title: invoice.service_name || "Dienstleistung",
    desc: invoice.description,
    qtyLabel: "1",
    amount: safeNum(invoice.net_amount),
  });

  const km = safeNum(invoice.kilometers);
  const kmAmount = safeNum(invoice.kilometer_amount);
  const kmRate = safeNum(invoice.kilometer_rate, 1);
  if (km > 0 && kmAmount > 0) {
    items.push({
      title: "Kilometergeld",
      desc: `${km} km × ${formatCurrency(kmRate)}/km`,
      qtyLabel: String(km),
      amount: kmAmount,
    });
  }

  const rowGap = 10;
  for (const item of items) {
    const titleSize = 11;
    const descSize = 9;

    page.drawText(item.title, {
      x: tableX,
      y,
      size: titleSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    const wrapped = wrapText({
      text: item.desc || "",
      font,
      fontSize: descSize,
      maxWidth: colDesc - 4,
    });
    let dy = y - 14;
    for (const line of wrapped.slice(0, 4)) {
      page.drawText(line, {
        x: tableX,
        y: dy,
        size: descSize,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
      dy -= 12;
    }

    page.drawText(item.qtyLabel, {
      x: tableX + colDesc,
      y,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    const amtText = formatCurrency(item.amount);
    page.drawText(amtText, {
      x: tableX + colDesc + colQty,
      y,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    const rowHeight = 14 + wrapped.slice(0, 4).length * 12 + rowGap;
    y -= rowHeight;

    page.drawLine({
      start: { x: tableX, y: y + 6 },
      end: { x: tableX + tableW, y: y + 6 },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });
    y -= 10;
  }

  // Totals (right)
  const subtotal = safeNum(invoice.net_amount) + kmAmount;
  const taxes = 0;
  const total = safeNum(invoice.gross_amount, subtotal);

  const totalsW = 240;
  const totalsX = width - margin - totalsW;
  const totalsY = y - 10;

  page.drawRectangle({
    x: totalsX,
    y: totalsY - 70,
    width: totalsW,
    height: 80,
    borderWidth: 1,
    borderColor: rgb(0.9, 0.9, 0.9),
    color: rgb(0.98, 0.98, 0.98),
  });

  const tLabelX = totalsX + 12;
  const tValueX = totalsX + totalsW - 12;
  let tY = totalsY;
  const drawTotalLine = (label: string, value: string, bold = false) => {
    page.drawText(label, {
      x: tLabelX,
      y: tY,
      size: 10,
      font: bold ? fontBold : font,
      color: rgb(0.2, 0.2, 0.2),
    });
    const textWidth = (bold ? fontBold : font).widthOfTextAtSize(value, 10);
    page.drawText(value, {
      x: tValueX - textWidth,
      y: tY,
      size: 10,
      font: bold ? fontBold : font,
      color: rgb(0.2, 0.2, 0.2),
    });
    tY -= 14;
  };

  drawTotalLine("Betrag", formatCurrency(subtotal));
  drawTotalLine("Steuern", formatCurrency(taxes));
  page.drawLine({
    start: { x: totalsX + 12, y: tY + 6 },
    end: { x: totalsX + totalsW - 12, y: tY + 6 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  tY -= 8;
  drawTotalLine("Summe", formatCurrency(total), true);

  // Payment terms
  y = totalsY - 110;
  const deposit = safeNum(invoice.deposit_amount);
  const remaining = safeNum(invoice.remaining_amount, Math.max(0, total - deposit));

  if (deposit > 0) {
    page.drawText("Zahlungsbedingungen", {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 16;

    const depText = `Der erste Teilbetrag von ${formatCurrency(deposit)}${invoice.deposit_due_date ? ` ist bis zum ${formatDate(invoice.deposit_due_date)} zu überweisen.` : " ist zu überweisen."}`;
    const remText = `Die ausstehende Restzahlung von ${formatCurrency(remaining)} nach Absolvierung der Veranstaltung.`;

    for (const line of wrapText({ text: depText, font, fontSize: 10, maxWidth: tableW })) {
      page.drawText(line, { x: margin, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 12;
    }
    y -= 4;
    for (const line of wrapText({ text: remText, font, fontSize: 10, maxWidth: tableW })) {
      page.drawText(line, { x: margin, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 12;
    }
  }

  // Kleinunternehmer
  y -= 14;
  const kleinText =
    "Der Rechnungsbetrag enthält gem. § 6 Abs. 1 Z 27 UStG 1994 keine Umsatzsteuer – Skonto Abzug nicht möglich.";
  for (const line of wrapText({ text: kleinText, font, fontSize: 9, maxWidth: tableW })) {
    page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.35, 0.35, 0.35) });
    y -= 11;
  }

  // Footer line
  const footerY = margin + 70;
  page.drawLine({
    start: { x: margin, y: footerY },
    end: { x: width - margin, y: footerY },
    thickness: 2,
    color: rgb(0, 0, 0),
  });

  // Footer cols
  const leftColX = margin;
  const rightColX = width / 2 + 10;
  let fy = footerY - 18;

  page.drawText("Bankverbindung", { x: leftColX, y: fy, size: 9, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
  page.drawText("Kontakt", { x: rightColX, y: fy, size: 9, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
  fy -= 14;

  const bankLines = ["Kontoinhaber: Marcel Fischer", "IBAN: AT66 1200 0502 2002 1997"];
  const contactLines = ["office@pixelpalast.at", "www.pixelpalast.at"];

  for (let i = 0; i < Math.max(bankLines.length, contactLines.length); i++) {
    if (bankLines[i]) {
      page.drawText(bankLines[i], { x: leftColX, y: fy, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    }
    if (contactLines[i]) {
      page.drawText(contactLines[i], { x: rightColX, y: fy, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    }
    fy -= 12;
  }

  return await pdfDoc.save();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { invoiceId, bookingId, createOnly }: GenerateInvoiceRequest = await req.json();
    console.log("Generating invoice:", { invoiceId, bookingId, createOnly });

    const invoice = await createOrLoadInvoice({ supabase, invoiceId, bookingId });

    if (createOnly) {
      return new Response(JSON.stringify({ success: true, invoice }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const referer = req.headers.get("referer");
    const derivedOrigin = referer ? new URL(referer).origin : null;
    const origin = req.headers.get("origin") ?? derivedOrigin;

    const pdfBytes = await generateInvoicePdf({ invoice, origin });
    // Normalize pdf-lib output to a standard Uint8Array<ArrayBuffer> so it matches Deno's BodyInit typing.
    const pdfBody = new Uint8Array(pdfBytes);

    return new Response(pdfBody, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
        "x-invoice-number": invoice.invoice_number,
        "Content-Disposition": `attachment; filename="Rechnung_${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
