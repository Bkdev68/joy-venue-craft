import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Euro,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  Upload,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Invoice {
  id: string;
  booking_id: string | null;
  invoice_number: string;
  customer_number: string | null;
  invoice_date: string;
  due_date: string | null;
  customer_name: string;
  customer_email: string | null;
  description: string;
  service_name: string | null;
  net_amount: number;
  gross_amount: number;
  kilometers: number;
  kilometer_rate: number;
  kilometer_amount: number;
  payment_status: string;
  deposit_amount: number;
  deposit_paid: boolean;
  remaining_amount: number;
  remaining_paid: boolean;
  pdf_url: string | null;
  created_at: string;
}

interface Expense {
  id: string;
  receipt_number: string | null;
  expense_date: string;
  vendor: string;
  category_id: string | null;
  description: string;
  net_amount: number;
  gross_amount: number;
  is_paid: boolean;
  receipt_url: string | null;
  receipt_file_path: string | null;
  recurring_expense_id: string | null;
  category?: ExpenseCategory;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
}

interface RecurringExpense {
  id: string;
  name: string;
  vendor: string;
  category_id: string | null;
  description: string | null;
  amount: number;
  interval: string;
  next_due_date: string;
  is_active: boolean;
  category?: ExpenseCategory;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  package_name: string;
  package_price: number;
  date: string;
  status: string;
}

export default function AdminBuchhaltung() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  // Dialog states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringExpense | null>(null);

  // Form states for invoice
  const [invoiceForm, setInvoiceForm] = useState({
    booking_id: '',
    customer_name: '',
    customer_email: '',
    description: '',
    service_name: '',
    net_amount: 0,
    kilometers: 0,
    kilometer_rate: 1.00,
    deposit_amount: 0,
    deposit_due_date: '',
    notes: ''
  });

  // Form states for expense
  const [expenseForm, setExpenseForm] = useState({
    receipt_number: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    vendor: '',
    category_id: '',
    description: '',
    gross_amount: 0,
    is_paid: false,
    receipt_file_path: ''
  });

  // Upload states
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [analyzingReceipt, setAnalyzingReceipt] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states for recurring expense
  const [recurringForm, setRecurringForm] = useState({
    name: '',
    vendor: '',
    category_id: '',
    description: '',
    amount: 0,
    interval: 'monatlich',
    next_due_date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

      // Fetch expenses with categories
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*, category:expense_categories(*)')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      // Fetch recurring expenses
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_expenses')
        .select('*, category:expense_categories(*)')
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (recurringError) throw recurringError;
      setRecurringExpenses(recurringData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch confirmed bookings without invoices
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'bestätigt')
        .order('date', { ascending: false });

      if (bookingsError) throw bookingsError;
      
      // Filter out bookings that already have invoices
      const invoiceBookingIds = invoicesData?.map(i => i.booking_id) || [];
      const availableBookings = (bookingsData || []).filter(
        b => !invoiceBookingIds.includes(b.id)
      );
      setBookings(availableBookings);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalIncome = invoices.reduce((sum, inv) => sum + Number(inv.gross_amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.gross_amount), 0);
  const profit = totalIncome - totalExpenses;
  const openInvoices = invoices.filter(inv => inv.payment_status === 'offen').length;
  const paidInvoices = invoices.filter(inv => inv.payment_status === 'bezahlt').length;

  // Generate invoice number
  const generateInvoiceNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) {
      console.error('Error generating invoice number:', error);
      return `${selectedYear}-001`;
    }
    return data;
  };

  // Create invoice from booking
  const createInvoiceFromBooking = (booking: Booking) => {
    setInvoiceForm({
      booking_id: booking.id,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      description: `${booking.package_name} - ${booking.service_name}`,
      service_name: booking.service_name,
      net_amount: booking.package_price,
      kilometers: 0,
      kilometer_rate: 1.00,
      deposit_amount: Math.round(booking.package_price / 2),
      deposit_due_date: '',
      notes: ''
    });
    setSelectedInvoice(null);
    setInvoiceDialogOpen(true);
  };

  // Save invoice
  const handleSaveInvoice = async () => {
    try {
      const invoiceNumber = selectedInvoice?.invoice_number || await generateInvoiceNumber();
      const kilometerAmount = invoiceForm.kilometers * invoiceForm.kilometer_rate;
      const grossAmount = invoiceForm.net_amount + kilometerAmount;
      const remainingAmount = grossAmount - invoiceForm.deposit_amount;

      const invoiceData = {
        invoice_number: invoiceNumber,
        booking_id: invoiceForm.booking_id || null,
        customer_name: invoiceForm.customer_name,
        customer_email: invoiceForm.customer_email || null,
        description: invoiceForm.description,
        service_name: invoiceForm.service_name || null,
        net_amount: invoiceForm.net_amount,
        gross_amount: grossAmount,
        kilometers: invoiceForm.kilometers,
        kilometer_rate: invoiceForm.kilometer_rate,
        kilometer_amount: kilometerAmount,
        deposit_amount: invoiceForm.deposit_amount,
        deposit_due_date: invoiceForm.deposit_due_date || null,
        remaining_amount: remainingAmount,
        notes: invoiceForm.notes || null,
        payment_status: 'offen'
      };

      if (selectedInvoice) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', selectedInvoice.id);
        if (error) throw error;
        toast({ title: "Rechnung aktualisiert" });
      } else {
        const { error } = await supabase
          .from('invoices')
          .insert([invoiceData]);
        if (error) throw error;
        toast({ title: "Rechnung erstellt" });
      }

      setInvoiceDialogOpen(false);
      resetInvoiceForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Upload receipt file
  const handleReceiptUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingReceipt(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return filePath;
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Analyze receipt with AI
  const handleAnalyzeReceipt = async (file: File) => {
    try {
      setAnalyzingReceipt(true);
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const token = sessionData?.session?.access_token;
      if (!token) {
        throw new Error('Nicht angemeldet – bitte neu einloggen.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Analyse fehlgeschlagen');
      }

      const data = result.data;
      
      // Find matching category
      let categoryId = '';
      if (data.category_suggestion) {
        const matchedCategory = categories.find(
          c => c.name.toLowerCase().includes(data.category_suggestion.toLowerCase()) ||
               data.category_suggestion.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCategory) {
          categoryId = matchedCategory.id;
        }
      }

      // Update form with extracted data
      setExpenseForm(prev => ({
        ...prev,
        vendor: data.vendor || prev.vendor,
        description: data.description || prev.description,
        gross_amount: data.amount || prev.gross_amount,
        expense_date: data.date || prev.expense_date,
        receipt_number: data.receipt_number || prev.receipt_number,
        category_id: categoryId || prev.category_id
      }));

      toast({
        title: "Rechnung analysiert",
        description: "Daten wurden automatisch übernommen"
      });

    } catch (error: any) {
      console.error('Error analyzing receipt:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAnalyzingReceipt(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Analyze the receipt
    await handleAnalyzeReceipt(file);
  };

  // Get receipt download URL
  const getReceiptUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('expense-receipts')
        .createSignedUrl(filePath, 3600); // 1 hour validity

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting receipt URL:', error);
      return null;
    }
  };

  // Download receipt
  const handleDownloadReceipt = async (expense: Expense) => {
    if (!expense.receipt_file_path) return;
    
    const url = await getReceiptUrl(expense.receipt_file_path);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Fehler",
        description: "Beleg konnte nicht geladen werden",
        variant: "destructive"
      });
    }
  };

  // Save expense
  const handleSaveExpense = async () => {
    try {
      // Upload file if selected
      let filePath = expenseForm.receipt_file_path;
      if (selectedFile) {
        const uploadedPath = await handleReceiptUpload(selectedFile);
        if (uploadedPath) {
          filePath = uploadedPath;
        }
      }

      const expenseData = {
        receipt_number: expenseForm.receipt_number || null,
        expense_date: expenseForm.expense_date,
        vendor: expenseForm.vendor,
        category_id: expenseForm.category_id || null,
        description: expenseForm.description,
        net_amount: expenseForm.gross_amount,
        gross_amount: expenseForm.gross_amount,
        is_paid: expenseForm.is_paid,
        receipt_file_path: filePath || null
      };

      if (selectedExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', selectedExpense.id);
        if (error) throw error;
        toast({ title: "Ausgabe aktualisiert" });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);
        if (error) throw error;
        toast({ title: "Ausgabe hinzugefügt" });
      }

      setExpenseDialogOpen(false);
      resetExpenseForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Save recurring expense
  const handleSaveRecurring = async () => {
    try {
      const recurringData = {
        name: recurringForm.name,
        vendor: recurringForm.vendor,
        category_id: recurringForm.category_id || null,
        description: recurringForm.description || null,
        amount: recurringForm.amount,
        interval: recurringForm.interval,
        next_due_date: recurringForm.next_due_date,
        is_active: true
      };

      if (selectedRecurring) {
        const { error } = await supabase
          .from('recurring_expenses')
          .update(recurringData)
          .eq('id', selectedRecurring.id);
        if (error) throw error;
        toast({ title: "Wiederkehrende Ausgabe aktualisiert" });
      } else {
        const { error } = await supabase
          .from('recurring_expenses')
          .insert([recurringData]);
        if (error) throw error;
        toast({ title: "Wiederkehrende Ausgabe hinzugefügt" });
      }

      setRecurringDialogOpen(false);
      resetRecurringForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving recurring expense:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Delete functions
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Rechnung wirklich löschen?')) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Rechnung gelöscht" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Ausgabe wirklich löschen?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Ausgabe gelöscht" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    if (!confirm('Wiederkehrende Ausgabe wirklich löschen?')) return;
    try {
      const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Wiederkehrende Ausgabe gelöscht" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  };

  // Update payment status
  const updatePaymentStatus = async (invoice: Invoice, status: string) => {
    try {
      const updates: any = { payment_status: status };
      if (status === 'bezahlt') {
        updates.deposit_paid = true;
        updates.remaining_paid = true;
      }
      
      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoice.id);
      
      if (error) throw error;
      toast({ title: "Status aktualisiert" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  };

  // Reset forms
  const resetInvoiceForm = () => {
    setInvoiceForm({
      booking_id: '',
      customer_name: '',
      customer_email: '',
      description: '',
      service_name: '',
      net_amount: 0,
      kilometers: 0,
      kilometer_rate: 1.00,
      deposit_amount: 0,
      deposit_due_date: '',
      notes: ''
    });
    setSelectedInvoice(null);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      receipt_number: '',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      vendor: '',
      category_id: '',
      description: '',
      gross_amount: 0,
      is_paid: false,
      receipt_file_path: ''
    });
    setSelectedExpense(null);
    setSelectedFile(null);
  };

  const resetRecurringForm = () => {
    setRecurringForm({
      name: '',
      vendor: '',
      category_id: '',
      description: '',
      amount: 0,
      interval: 'monatlich',
      next_due_date: format(new Date(), 'yyyy-MM-dd')
    });
    setSelectedRecurring(null);
  };

  // Export functions
  const exportToCSV = (type: 'income' | 'expenses' | 'all') => {
    let csvContent = '';
    const BOM = '\uFEFF';
    
    if (type === 'income' || type === 'all') {
      csvContent += 'EINNAHMEN\n';
      csvContent += 'Rechnungsnummer;Datum;Kunde;Beschreibung;Betrag;Kilometer;km-Betrag;Gesamt;Status\n';
      invoices.forEach(inv => {
        csvContent += `${inv.invoice_number};${format(new Date(inv.invoice_date), 'dd.MM.yyyy')};${inv.customer_name};${inv.description};${inv.net_amount};${inv.kilometers};${inv.kilometer_amount};${inv.gross_amount};${inv.payment_status}\n`;
      });
      csvContent += `\nSumme Einnahmen:;${totalIncome.toFixed(2)} €\n\n`;
    }
    
    if (type === 'expenses' || type === 'all') {
      csvContent += 'AUSGABEN\n';
      csvContent += 'Belegnummer;Datum;Lieferant;Kategorie;Beschreibung;Betrag;Bezahlt\n';
      expenses.forEach(exp => {
        csvContent += `${exp.receipt_number || '-'};${format(new Date(exp.expense_date), 'dd.MM.yyyy')};${exp.vendor};${exp.category?.name || '-'};${exp.description};${exp.gross_amount};${exp.is_paid ? 'Ja' : 'Nein'}\n`;
      });
      csvContent += `\nSumme Ausgaben:;${totalExpenses.toFixed(2)} €\n\n`;
    }
    
    if (type === 'all') {
      csvContent += `GEWINN/VERLUST:;${profit.toFixed(2)} €\n`;
    }

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buchhaltung_${selectedYear}_${type}.csv`;
    link.click();
    
    toast({ title: "Export erfolgreich" });
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv =>
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter expenses
  const filteredExpenses = expenses.filter(exp =>
    exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const years = ['2024', '2025', '2026', '2027'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Buchhaltung</h1>
          <p className="text-muted-foreground">Einnahmen, Ausgaben & Finanzübersicht</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Jahr" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportToCSV('all')}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Einnahmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-muted-foreground">{invoices.length} Rechnungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Ausgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {totalExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-muted-foreground">{expenses.length} Belege</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Gewinn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl sm:text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-muted-foreground">Netto-Ergebnis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Offene Rechnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">{openInvoices}</p>
            <p className="text-xs text-muted-foreground">{paidInvoices} bezahlt</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Bookings Alert */}
      {bookings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Bestätigte Buchungen ohne Rechnung ({bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bookings.slice(0, 5).map(booking => (
                <Button 
                  key={booking.id} 
                  variant="outline" 
                  size="sm"
                  onClick={() => createInvoiceFromBooking(booking)}
                  className="text-xs"
                >
                  {booking.customer_name} - {format(new Date(booking.date), 'dd.MM.yy')}
                </Button>
              ))}
              {bookings.length > 5 && (
                <Badge variant="secondary">+{bookings.length - 5} weitere</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="income" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="income" className="flex-1 sm:flex-none">Einnahmen</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 sm:flex-none">Ausgaben</TabsTrigger>
            <TabsTrigger value="recurring" className="flex-1 sm:flex-none">Wiederkehrend</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Rechnungen {selectedYear}</h3>
            <Button onClick={() => { resetInvoiceForm(); setInvoiceDialogOpen(true); }} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neue Rechnung
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr.</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead className="hidden md:table-cell">Beschreibung</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Keine Rechnungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                      <TableCell>{format(new Date(invoice.invoice_date), 'dd.MM.yy')}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{invoice.customer_name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">{invoice.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(invoice.gross_amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={invoice.payment_status} 
                          onValueChange={(value) => updatePaymentStatus(invoice, value)}
                        >
                          <SelectTrigger className="w-[110px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="offen">
                              <Badge variant="outline" className="text-orange-600">Offen</Badge>
                            </SelectItem>
                            <SelectItem value="teilzahlung">
                              <Badge variant="outline" className="text-blue-600">Teilzahlung</Badge>
                            </SelectItem>
                            <SelectItem value="bezahlt">
                              <Badge variant="outline" className="text-green-600">Bezahlt</Badge>
                            </SelectItem>
                            <SelectItem value="storniert">
                              <Badge variant="outline" className="text-red-600">Storniert</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setInvoiceForm({
                                booking_id: invoice.booking_id || '',
                                customer_name: invoice.customer_name,
                                customer_email: invoice.customer_email || '',
                                description: invoice.description,
                                service_name: invoice.service_name || '',
                                net_amount: Number(invoice.net_amount),
                                kilometers: Number(invoice.kilometers),
                                kilometer_rate: Number(invoice.kilometer_rate),
                                deposit_amount: Number(invoice.deposit_amount),
                                deposit_due_date: '',
                                notes: ''
                              });
                              setInvoiceDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Ausgaben {selectedYear}</h3>
            <Button onClick={() => { resetExpenseForm(); setExpenseDialogOpen(true); }} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neue Ausgabe
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Lieferant</TableHead>
                  <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Bezahlt</TableHead>
                  <TableHead>Beleg</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Keine Ausgaben gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.expense_date), 'dd.MM.yy')}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{expense.vendor}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{expense.category?.name || '-'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(expense.gross_amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={expense.is_paid ? "default" : "outline"}>
                          {expense.is_paid ? 'Ja' : 'Nein'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.receipt_file_path ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => handleDownloadReceipt(expense)}
                            title="Beleg herunterladen"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setExpenseForm({
                                receipt_number: expense.receipt_number || '',
                                expense_date: expense.expense_date,
                                vendor: expense.vendor,
                                category_id: expense.category_id || '',
                                description: expense.description,
                                gross_amount: Number(expense.gross_amount),
                                is_paid: expense.is_paid,
                                receipt_file_path: expense.receipt_file_path || ''
                              });
                              setExpenseDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Recurring Tab */}
        <TabsContent value="recurring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Wiederkehrende Ausgaben</h3>
            <Button onClick={() => { resetRecurringForm(); setRecurringDialogOpen(true); }} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neue wiederkehrende Ausgabe
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Lieferant</TableHead>
                  <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Intervall</TableHead>
                  <TableHead>Nächste Fälligkeit</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Keine wiederkehrenden Ausgaben
                    </TableCell>
                  </TableRow>
                ) : (
                  recurringExpenses.map((recurring) => (
                    <TableRow key={recurring.id}>
                      <TableCell className="font-medium">{recurring.name}</TableCell>
                      <TableCell>{recurring.vendor}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{recurring.category?.name || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(recurring.amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{recurring.interval}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(recurring.next_due_date), 'dd.MM.yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedRecurring(recurring);
                              setRecurringForm({
                                name: recurring.name,
                                vendor: recurring.vendor,
                                category_id: recurring.category_id || '',
                                description: recurring.description || '',
                                amount: Number(recurring.amount),
                                interval: recurring.interval,
                                next_due_date: recurring.next_due_date
                              });
                              setRecurringDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteRecurring(recurring.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice ? 'Rechnung bearbeiten' : 'Neue Rechnung'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Kunde *</Label>
                <Input
                  value={invoiceForm.customer_name}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customer_name: e.target.value })}
                  placeholder="Kundenname"
                />
              </div>
              <div className="col-span-2">
                <Label>E-Mail</Label>
                <Input
                  type="email"
                  value={invoiceForm.customer_email}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customer_email: e.target.value })}
                  placeholder="kunde@email.at"
                />
              </div>
              <div className="col-span-2">
                <Label>Leistung *</Label>
                <Input
                  value={invoiceForm.service_name}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, service_name: e.target.value })}
                  placeholder="z.B. 360° Video Spinner"
                />
              </div>
              <div className="col-span-2">
                <Label>Beschreibung *</Label>
                <Textarea
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  placeholder="Details zur Leistung..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Betrag (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceForm.net_amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, net_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Anzahlung (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceForm.deposit_amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, deposit_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Kilometer</Label>
                <Input
                  type="number"
                  step="1"
                  value={invoiceForm.kilometers}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, kilometers: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>€/km</Label>
                <Select 
                  value={invoiceForm.kilometer_rate.toString()} 
                  onValueChange={(v) => setInvoiceForm({ ...invoiceForm, kilometer_rate: parseFloat(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.00">€1,00/km</SelectItem>
                    <SelectItem value="0.50">€0,50/km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {invoiceForm.kilometers > 0 && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Leistung:</span>
                  <span>{invoiceForm.net_amount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Kilometer ({invoiceForm.kilometers} × {invoiceForm.kilometer_rate.toFixed(2)} €):</span>
                  <span>{(invoiceForm.kilometers * invoiceForm.kilometer_rate).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1 mt-1">
                  <span>Gesamt:</span>
                  <span>{(invoiceForm.net_amount + invoiceForm.kilometers * invoiceForm.kilometer_rate).toFixed(2)} €</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveInvoice} disabled={!invoiceForm.customer_name || !invoiceForm.description}>
              {selectedInvoice ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedExpense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Receipt Upload Section */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                id="receipt-upload"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <label 
                htmlFor="receipt-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {analyzingReceipt ? (
                  <>
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Rechnung wird analysiert...</span>
                  </>
                ) : uploadingReceipt ? (
                  <>
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Wird hochgeladen...</span>
                  </>
                ) : selectedFile ? (
                  <>
                    <FileText className="h-8 w-8 text-green-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">Klicken um zu ändern</span>
                  </>
                ) : expenseForm.receipt_file_path ? (
                  <>
                    <FileText className="h-8 w-8 text-green-500" />
                    <span className="text-sm font-medium">Beleg vorhanden</span>
                    <span className="text-xs text-muted-foreground">Klicken um zu ändern</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Rechnung hochladen</span>
                    <span className="text-xs text-muted-foreground">
                      Bild oder PDF - wird automatisch analysiert
                    </span>
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Datum *</Label>
                <Input
                  type="date"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Belegnummer</Label>
                <Input
                  value={expenseForm.receipt_number}
                  onChange={(e) => setExpenseForm({ ...expenseForm, receipt_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="col-span-2">
                <Label>Lieferant *</Label>
                <Input
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                  placeholder="z.B. Amazon, Adobe"
                />
              </div>
              <div className="col-span-2">
                <Label>Kategorie</Label>
                <Select 
                  value={expenseForm.category_id} 
                  onValueChange={(v) => setExpenseForm({ ...expenseForm, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Beschreibung *</Label>
                <Textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Was wurde gekauft?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Betrag (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={expenseForm.gross_amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, gross_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expenseForm.is_paid}
                    onChange={(e) => setExpenseForm({ ...expenseForm, is_paid: e.target.checked })}
                    className="rounded"
                  />
                  <span>Bezahlt</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>Abbrechen</Button>
            <Button 
              onClick={handleSaveExpense} 
              disabled={!expenseForm.vendor || !expenseForm.description || uploadingReceipt || analyzingReceipt}
            >
              {uploadingReceipt ? 'Wird hochgeladen...' : (selectedExpense ? 'Speichern' : 'Hinzufügen')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Expense Dialog */}
      <Dialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRecurring ? 'Wiederkehrende Ausgabe bearbeiten' : 'Neue wiederkehrende Ausgabe'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Name *</Label>
                <Input
                  value={recurringForm.name}
                  onChange={(e) => setRecurringForm({ ...recurringForm, name: e.target.value })}
                  placeholder="z.B. Adobe Creative Cloud"
                />
              </div>
              <div className="col-span-2">
                <Label>Lieferant *</Label>
                <Input
                  value={recurringForm.vendor}
                  onChange={(e) => setRecurringForm({ ...recurringForm, vendor: e.target.value })}
                  placeholder="z.B. Adobe"
                />
              </div>
              <div className="col-span-2">
                <Label>Kategorie</Label>
                <Select 
                  value={recurringForm.category_id} 
                  onValueChange={(v) => setRecurringForm({ ...recurringForm, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Betrag (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm({ ...recurringForm, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Intervall *</Label>
                <Select 
                  value={recurringForm.interval} 
                  onValueChange={(v) => setRecurringForm({ ...recurringForm, interval: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monatlich">Monatlich</SelectItem>
                    <SelectItem value="vierteljährlich">Vierteljährlich</SelectItem>
                    <SelectItem value="jährlich">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Nächste Fälligkeit *</Label>
                <Input
                  type="date"
                  value={recurringForm.next_due_date}
                  onChange={(e) => setRecurringForm({ ...recurringForm, next_due_date: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={recurringForm.description}
                  onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                  placeholder="Optional"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecurringDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveRecurring} disabled={!recurringForm.name || !recurringForm.vendor}>
              {selectedRecurring ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
