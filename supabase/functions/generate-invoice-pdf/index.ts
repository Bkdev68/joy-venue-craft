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
  billingCompany?: string;
  billingStreet?: string;
  billingZip?: string;
  billingCity?: string;
  billingCountry?: string;
  billingVatId?: string;
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

// Pixelpalast Logo as base64 SVG
const logoBase64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHg9IjUiIHk9IjUiIHJ4PSI4IiBmaWxsPSIjMDAwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzOCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UFA8L3RleHQ+Cjx0ZXh0IHg9IjY1IiB5PSIyNSIgZm9udC1mYW1pbHk9IkhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMCIgbGV0dGVyLXNwYWNpbmc9IjEiPlBJWEVMPC90ZXh0Pgo8dGV4dCB4PSI2NSIgeT0iMzgiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwMDAiIGxldHRlci1zcGFjaW5nPSIxIj5QQUxBU1Q8L3RleHQ+Cjwvc3ZnPg==`;

// Generate invoice HTML with professional PDF styling
function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (amount: number) => 
    amount.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Build customer address block
  const customerAddressLines: string[] = [];
  if (data.billingCompany) customerAddressLines.push(`<strong>${data.billingCompany}</strong>`);
  customerAddressLines.push(data.customerName);
  if (data.billingStreet) customerAddressLines.push(data.billingStreet);
  if (data.billingZip || data.billingCity) {
    customerAddressLines.push(`${data.billingZip || ''} ${data.billingCity || ''}`.trim());
  }
  if (data.billingCountry && data.billingCountry !== 'Österreich') {
    customerAddressLines.push(data.billingCountry);
  }
  if (data.billingVatId) customerAddressLines.push(`UID: ${data.billingVatId}`);

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Rechnung ${data.invoiceNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 20mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
      font-size: 10pt; 
      color: #1a1a1a; 
      line-height: 1.5; 
      padding: 0;
      background: white;
    }
    .invoice-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm 20mm;
      background: white;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logo-section img {
      height: 50px;
      width: auto;
    }
    .company-info { 
      text-align: right; 
      font-size: 9pt; 
      color: #555;
      line-height: 1.6;
    }
    h1 { 
      font-size: 32pt; 
      font-weight: 300; 
      letter-spacing: 3px; 
      margin: 25px 0;
      text-transform: uppercase;
      color: #000;
    }
    .invoice-meta { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 30px;
      gap: 40px;
    }
    .customer { 
      flex: 1;
    }
    .customer-label { 
      font-size: 8pt; 
      color: #888; 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      margin-bottom: 8px;
    }
    .customer-address {
      font-size: 10pt;
      line-height: 1.6;
    }
    .invoice-details { 
      text-align: right;
    }
    .invoice-details table { 
      margin-left: auto; 
    }
    .invoice-details td { 
      padding: 4px 0; 
    }
    .invoice-details td:first-child { 
      color: #888; 
      padding-right: 20px; 
      text-transform: uppercase; 
      font-size: 8pt; 
      letter-spacing: 1px; 
    }
    .invoice-details td:last-child {
      font-weight: 500;
    }
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 25px 0; 
    }
    .items-table th { 
      text-align: left; 
      padding: 12px 0; 
      border-bottom: 2px solid #000; 
      text-transform: uppercase; 
      font-size: 8pt; 
      letter-spacing: 1px;
      font-weight: 600;
    }
    .items-table th:nth-child(2) { text-align: center; }
    .items-table th:last-child { text-align: right; }
    .items-table td { 
      padding: 15px 0; 
      border-bottom: 1px solid #e5e5e5;
      vertical-align: top;
    }
    .items-table td:nth-child(2) { text-align: center; }
    .items-table td:last-child { text-align: right; }
    .item-title { font-weight: 500; }
    .item-description { 
      font-size: 9pt; 
      color: #666; 
      margin-top: 4px; 
    }
    .totals { 
      margin-left: auto; 
      width: 280px; 
      margin-top: 20px; 
    }
    .totals table { width: 100%; }
    .totals td { padding: 8px 0; }
    .totals td:last-child { text-align: right; font-weight: 500; }
    .totals .total-row { 
      font-size: 14pt; 
      font-weight: 700; 
      border-top: 2px solid #000;
      padding-top: 12px;
    }
    .totals .total-row td { padding-top: 12px; }
    .payment-info { 
      margin-top: 30px; 
      padding: 20px; 
      background: #f8f8f8; 
      border-radius: 4px;
      border-left: 4px solid #000;
    }
    .payment-info h3 { 
      font-size: 9pt; 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      margin-bottom: 10px;
      font-weight: 600;
    }
    .payment-info p { 
      margin: 6px 0; 
      font-size: 10pt; 
    }
    .kleinunternehmer { 
      margin-top: 25px; 
      font-size: 9pt; 
      color: #666; 
      font-style: italic;
      padding: 15px;
      background: #fafafa;
      border-radius: 4px;
    }
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 2px solid #000; 
      font-size: 9pt; 
    }
    .footer-grid {
      display: flex;
      justify-content: space-between;
    }
    .footer-col h4 {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      color: #888;
    }
    .footer-col p {
      margin: 3px 0;
    }
    .print-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #000;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .print-button:hover {
      background: #333;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo-section">
        <img src="${logoBase64}" alt="Pixelpalast Logo" />
      </div>
      <div class="company-info">
        <p><strong>Marcel Fischer</strong></p>
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
        <div class="customer-address">
          ${customerAddressLines.join('<br>')}
        </div>
        ${data.customerEmail ? `<p style="margin-top: 8px; color: #666; font-size: 9pt;">${data.customerEmail}</p>` : ''}
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
            <div class="item-title">${data.serviceName}</div>
            <div class="item-description">${data.description}</div>
          </td>
          <td>1</td>
          <td>${formatCurrency(data.netAmount)}</td>
        </tr>
        ${data.kilometers > 0 ? `
        <tr>
          <td>
            <div class="item-title">Kilometergeld</div>
            <div class="item-description">${data.kilometers} km × ${formatCurrency(data.kilometerRate)}/km</div>
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
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Bankverbindung</h4>
          <p><strong>Kontoinhaber:</strong> Marcel Fischer</p>
          <p><strong>IBAN:</strong> AT66 1200 0502 2002 1997</p>
        </div>
        <div class="footer-col">
          <h4>Kontakt</h4>
          <p>office@pixelpalast.at</p>
          <p>www.pixelpalast.at</p>
        </div>
      </div>
    </div>
  </div>

  <button class="print-button no-print" onclick="window.print()">
    📄 Als PDF speichern
  </button>
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
    console.log("Generating invoice for:", { invoiceId, bookingId });

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
      console.log("Found booking:", booking);

      // Check if invoice already exists for this booking
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (existingInvoice) {
        console.log("Invoice already exists:", existingInvoice.invoice_number);
        invoiceData = existingInvoice;
      } else {
        // Generate invoice number
        const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');
        console.log("Generated invoice number:", invoiceNumber);

        const grossAmount = booking.package_price;
        const depositAmount = Math.round(grossAmount / 2);

        // Create invoice in database with billing info from booking
        const { data: newInvoice, error: insertError } = await supabase
          .from('invoices')
          .insert({
            booking_id: bookingId,
            invoice_number: invoiceNumber,
            customer_name: booking.billing_name || booking.customer_name,
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
            payment_status: 'offen',
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

        if (insertError) {
          console.error("Error creating invoice:", insertError);
          throw insertError;
        }
        console.log("Created new invoice:", newInvoice.invoice_number);
        invoiceData = newInvoice;
      }
    } else {
      throw new Error('Either invoiceId or bookingId is required');
    }

    // Generate HTML
    const html = generateInvoiceHTML({
      invoiceNumber: invoiceData.invoice_number,
      invoiceDate: invoiceData.invoice_date || new Date().toISOString(),
      customerName: invoiceData.customer_name,
      customerEmail: invoiceData.customer_email,
      billingCompany: invoiceData.billing_company,
      billingStreet: invoiceData.billing_street,
      billingZip: invoiceData.billing_zip,
      billingCity: invoiceData.billing_city,
      billingCountry: invoiceData.billing_country,
      billingVatId: invoiceData.billing_vat_id,
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

    console.log("Invoice HTML generated successfully");

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
