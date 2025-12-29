import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
}

const categories = ['Allgemein', 'Buchung', 'Preise', 'Technik', 'Service'];

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Allgemein',
  });

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const faqData = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
      };

      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(faqData)
          .eq('id', editingFaq.id);

        if (error) throw error;
        toast.success('FAQ aktualisiert');
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert({
            ...faqData,
            sort_order: faqs.length,
          });

        if (error) throw error;
        toast.success('FAQ hinzugefügt');
      }

      setDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'Allgemein',
    });
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'Allgemein',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('FAQ wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('FAQ gelöscht');
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const toggleActive = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !faq.is_active })
        .eq('id', faq.id);

      if (error) throw error;
      fetchFaqs();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQ</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie häufig gestellte Fragen</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              FAQ hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'FAQ bearbeiten' : 'Neue FAQ'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Frage</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="z.B. Wie lange dauert eine Buchung?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Antwort</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Die ausführliche Antwort..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Laden...</div>
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine FAQs vorhanden.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <Card key={faq.id} className={!faq.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-0">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{faq.question}</h3>
                    <span className="text-xs text-muted-foreground">{faq.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(faq);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {faq.is_active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(faq);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(faq.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedId === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                {expandedId === faq.id && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3">
                    {faq.answer}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
