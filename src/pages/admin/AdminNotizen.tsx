import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pin, PinOff, Pencil, Trash2, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Note {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminNotizen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    }
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: { title: string; content: string }) => {
      const { error } = await supabase.from('notes').insert({
        title: noteData.title,
        content: noteData.content,
        user_id: user?.id,
        user_email: user?.email || 'Unbekannt'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Notiz erstellt' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Fehler beim Erstellen', variant: 'destructive' });
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; content?: string; is_pinned?: boolean }) => {
      const { error } = await supabase.from('notes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Notiz aktualisiert' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'Fehler beim Aktualisieren', variant: 'destructive' });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Notiz gelöscht' });
    },
    onError: () => {
      toast({ title: 'Fehler beim Löschen', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, title, content });
    } else {
      createNoteMutation.mutate({ title, content });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setIsDialogOpen(true);
  };

  const handleTogglePin = (note: Note) => {
    updateNoteMutation.mutate({ id: note.id, is_pinned: !note.is_pinned });
  };

  const canEditNote = (note: Note) => {
    return note.user_id === user?.id;
  };

  const pinnedNotes = notes.filter(n => n.is_pinned);
  const regularNotes = notes.filter(n => !n.is_pinned);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team-Notizen</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gemeinsame Notizen für das Team
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Neue Notiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Notiz bearbeiten' : 'Neue Notiz erstellen'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notiz-Titel"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Inhalt</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Notiz-Inhalt..."
                  rows={6}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Abbrechen
                </Button>
                <Button type="submit" className="flex-1">
                  {editingNote ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Noch keine Notizen vorhanden.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Erstelle die erste Notiz für das Team.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Angepinnt
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    canEdit={canEditNote(note)}
                    onEdit={() => handleEdit(note)}
                    onDelete={() => deleteNoteMutation.mutate(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground">
                  Alle Notizen
                </h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {regularNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    canEdit={canEditNote(note)}
                    onEdit={() => handleEdit(note)}
                    onDelete={() => deleteNoteMutation.mutate(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

function NoteCard({ note, canEdit, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <Card className={note.is_pinned ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{note.title}</CardTitle>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onTogglePin}
              title={note.is_pinned ? 'Lösen' : 'Anpinnen'}
            >
              {note.is_pinned ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {note.content && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {note.content}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="truncate max-w-[120px]" title={note.user_email}>
            {note.user_email.split('@')[0]}
          </span>
          <span>
            {format(new Date(note.updated_at), 'dd.MM.yy HH:mm', { locale: de })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
