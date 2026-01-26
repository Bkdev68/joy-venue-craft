import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Shield, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | null;
  createdAt: string;
  lastSignIn: string | null;
}

interface UserFormData {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'editor';
}

const defaultFormData: UserFormData = {
  email: '',
  password: '',
  displayName: '',
  role: 'editor',
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nicht eingeloggt');

      const response = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' },
      });

      if (response.error) throw response.error;
      return response.data.users as AdminUser[];
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: data.email,
          password: data.password,
          displayName: data.displayName,
          role: data.role,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Benutzer erfolgreich erstellt');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<UserFormData> }) => {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          userId,
          email: data.email,
          password: data.password || undefined,
          displayName: data.displayName,
          role: data.role,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Benutzer erfolgreich aktualisiert');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Benutzer erfolgreich gelöscht');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleOpenCreateDialog = () => {
    setFormData(defaultFormData);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      displayName: user.displayName,
      role: user.role || 'editor',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(defaultFormData);
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && selectedUser) {
      updateUserMutation.mutate({
        userId: selectedUser.id,
        data: formData,
      });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="bg-primary">
            <Shield className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
        );
      case 'editor':
        return (
          <Badge variant="secondary">
            <User className="h-3 w-3 mr-1" />
            Editor
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Keine Rolle
          </Badge>
        );
    }
  };

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Zugriffsrechte für Ihr Team
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Benutzer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team-Mitglieder
          </CardTitle>
          <CardDescription>
            Alle Benutzer mit Zugriff auf den Admin-Bereich
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Benutzer gefunden
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Letzter Login</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.role).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.displayName || user.email}
                        </div>
                        {user.displayName && (
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.createdAt), 'dd. MMM yyyy', { locale: de })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.lastSignIn
                        ? format(new Date(user.lastSignIn), 'dd. MMM yyyy, HH:mm', { locale: de })
                        : 'Nie'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDeleteDialog(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Benutzer bearbeiten' : 'Neuen Benutzer erstellen'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Bearbeiten Sie die Daten des Benutzers. Lassen Sie das Passwort leer, um es nicht zu ändern.'
                : 'Erstellen Sie einen neuen Benutzer mit Zugriff auf den Admin-Bereich.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Anzeigename</Label>
              <Input
                id="displayName"
                placeholder="z.B. Max Mustermann"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="max@beispiel.at"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Passwort {isEditing ? '(leer lassen um beizubehalten)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                required={!isEditing}
                minLength={6}
                placeholder="Mindestens 6 Zeichen"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rolle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'editor') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrator - Voller Zugriff
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Editor - Eingeschränkter Zugriff
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Benutzer{' '}
              <strong>{selectedUser?.displayName || selectedUser?.email}</strong> wirklich
              löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
