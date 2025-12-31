import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  serviceName: string;
  description: string;
  netAmount: number;
  kilometers: number;
  kilometerRate: number;
  kilometerAmount: number;
  grossAmount: number;
  depositAmount: number;
  depositDueDate?: string;
  remainingAmount: number;
}

// Generate invoice HTML
function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (amount: number) => 
    amount.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.5; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24pt; font-weight: bold; letter-spacing: 2px; }
    .company-info { text-align: right; font-size: 9pt; color: #666; }
    .company-info p { margin: 2px 0; }
    h1 { font-size: 28pt; font-weight: 300; letter-spacing: 4px; margin-bottom: 30px; text-transform: uppercase; }
    .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .customer { max-width: 50%; }
    .customer-label { font-size: 9pt; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .customer-name { font-size: 14pt; font-weight: bold; }
    .invoice-details { text-align: right; }
    .invoice-details table { margin-left: auto; }
    .invoice-details td { padding: 3px 0; }
    .invoice-details td:first-child { color: #666; padding-right: 20px; text-transform: uppercase; font-size: 9pt; letter-spacing: 1px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .items-table th { text-align: left; padding: 12px 0; border-bottom: 2px solid #333; text-transform: uppercase; font-size: 9pt; letter-spacing: 1px; }
    .items-table th:last-child { text-align: right; }
    .items-table td { padding: 15px 0; border-bottom: 1px solid #eee; }
    .items-table td:last-child { text-align: right; }
    .items-table .description { font-size: 10pt; color: #666; margin-top: 5px; }
    .totals { margin-left: auto; width: 300px; margin-top: 20px; }
    .totals table { width: 100%; }
    .totals td { padding: 8px 0; }
    .totals td:last-child { text-align: right; }
    .totals .total-row { font-size: 14pt; font-weight: bold; border-top: 2px solid #333; }
    .payment-info { margin-top: 40px; padding: 20px; background: #f8f8f8; border-radius: 4px; }
    .payment-info h3 { font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .payment-info p { margin: 5px 0; font-size: 10pt; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 9pt; color: #666; }
    .footer p { margin: 3px 0; }
    .kleinunternehmer { margin-top: 20px; font-size: 9pt; color: #666; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PIXELPALAST</div>
    <div class="company-info">
      <p>Marcel Fischer</p>
      <p>Wildstraße 5</p>
      <p>2100 Korneuburg</p>
      <p>E-Mail: office@pixelpalast.at</p>
      <p>Telefon: +43 660 2545493</p>
    </div>
  </div>

  <h1>Rechnung</h1>

  <div class="invoice-meta">
    <div class="customer">
      <div class="customer-label">Empfänger</div>
      <div class="customer-name">${data.customerName}</div>
      ${data.customerEmail ? `<p>${data.customerEmail}</p>` : ''}
      ${data.customerAddress ? `<p>${data.customerAddress}</p>` : ''}
    </div>
    <div class="invoice-details">
      <table>
        <tr><td>Rechnungs-Nr.:</td><td><strong>${data.invoiceNumber}</strong></td></tr>
        <tr><td>Datum:</td><td>${formatDate(data.invoiceDate)}</td></tr>
      </table>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Beschreibung</th>
        <th>Menge</th>
        <th>Betrag</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${data.serviceName}</strong>
          <div class="description">${data.description}</div>
        </td>
        <td>1</td>
        <td>${formatCurrency(data.netAmount)}</td>
      </tr>
      ${data.kilometers > 0 ? `
      <tr>
        <td>
          <strong>Kilometergeld</strong>
          <div class="description">${data.kilometers} km × ${formatCurrency(data.kilometerRate)}/km</div>
        </td>
        <td>${data.kilometers}</td>
        <td>${formatCurrency(data.kilometerAmount)}</td>
      </tr>
      ` : ''}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Betrag</td>
        <td>${formatCurrency(data.netAmount + data.kilometerAmount)}</td>
      </tr>
      <tr>
        <td>Steuern</td>
        <td>${formatCurrency(0)}</td>
      </tr>
      <tr class="total-row">
        <td>Summe</td>
        <td>${formatCurrency(data.grossAmount)}</td>
      </tr>
    </table>
  </div>

  ${data.depositAmount > 0 ? `
  <div class="payment-info">
    <h3>Zahlungsbedingungen</h3>
    <p>Der erste Teilbetrag von <strong>${formatCurrency(data.depositAmount)}</strong>${data.depositDueDate ? ` ist bis zum ${formatDate(data.depositDueDate)}` : ''} zu überweisen.</p>
    <p>Die ausstehende Restzahlung von <strong>${formatCurrency(data.remainingAmount)}</strong> nach Absolvierung der Veranstaltung.</p>
  </div>
  ` : ''}

  <p class="kleinunternehmer">
    Der Rechnungsbetrag enthält gem. § 6 Abs. 1 Z 27 UStG 1994 keine Umsatzsteuer – Skonto Abzug nicht möglich
  </p>

  <div class="footer">
    <p><strong>Kontoinhaber:</strong> Marcel Fischer</p>
    <p><strong>IBAN:</strong> AT66 1200 0502 2002 1997</p>
  </div>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { invoiceId, bookingId } = await req.json();

    let invoiceData: any;

    if (invoiceId) {
      // Get existing invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      invoiceData = invoice;
    } else if (bookingId) {
      // Create invoice from booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

      const grossAmount = booking.package_price;
      const depositAmount = Math.round(grossAmount / 2);

      // Create invoice in database
      const { data: newInvoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          booking_id: bookingId,
          invoice_number: invoiceNumber,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          description: `${booking.package_name} - ${booking.event_type}`,
          service_name: booking.service_name,
          net_amount: grossAmount,
          gross_amount: grossAmount,
          kilometers: 0,
          kilometer_rate: 1.00,
          kilometer_amount: 0,
          deposit_amount: depositAmount,
          remaining_amount: grossAmount - depositAmount,
          payment_status: 'offen'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      invoiceData = newInvoice;
    } else {
      throw new Error('Either invoiceId or bookingId is required');
    }

    // Generate HTML
    const html = generateInvoiceHTML({
      invoiceNumber: invoiceData.invoice_number,
      invoiceDate: invoiceData.invoice_date || new Date().toISOString(),
      customerName: invoiceData.customer_name,
      customerEmail: invoiceData.customer_email,
      customerAddress: invoiceData.customer_address,
      serviceName: invoiceData.service_name || 'Dienstleistung',
      description: invoiceData.description,
      netAmount: Number(invoiceData.net_amount),
      kilometers: Number(invoiceData.kilometers) || 0,
      kilometerRate: Number(invoiceData.kilometer_rate) || 1,
      kilometerAmount: Number(invoiceData.kilometer_amount) || 0,
      grossAmount: Number(invoiceData.gross_amount),
      depositAmount: Number(invoiceData.deposit_amount) || 0,
      depositDueDate: invoiceData.deposit_due_date,
      remainingAmount: Number(invoiceData.remaining_amount) || 0,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        html,
        invoice: invoiceData
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error generating invoice:", error);
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
