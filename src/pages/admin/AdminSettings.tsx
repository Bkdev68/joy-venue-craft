import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Mail, Phone, MapPin, Instagram, Facebook, BarChart3, Construction, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { useAuth } from '@/hooks/useAuth';

interface Settings {
  booking_email: string;
  contact_email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  google_analytics_id: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    booking_email: '',
    contact_email: '',
    phone: '',
    address: '',
    instagram: '',
    facebook: '',
    google_analytics_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setMaintenanceToggling(true);
    try {
      await setMaintenanceMode(enabled);
      toast.success(enabled ? 'Wartungsmodus aktiviert' : 'Wartungsmodus deaktiviert');
    } catch (error) {
      toast.error('Fehler beim Ändern des Wartungsmodus');
    } finally {
      setMaintenanceToggling(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Bitte beide Felder ausfüllen');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen haben');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }
    
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Passwort erfolgreich geändert');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Fehler beim Ändern des Passworts');
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('section', 'settings');

        if (error) throw error;

        const settingsMap: Record<string, string> = {};
        (data || []).forEach((item) => {
          settingsMap[item.key] = item.text_value || '';
        });

        setSettings({
          booking_email: settingsMap.booking_email || '',
          contact_email: settingsMap.contact_email || '',
          phone: settingsMap.phone || '',
          address: settingsMap.address || '',
          instagram: settingsMap.instagram || '',
          facebook: settingsMap.facebook || '',
          google_analytics_id: settingsMap.google_analytics_id || '',
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Fehler beim Laden der Einstellungen');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        section: 'settings',
        key,
        content_type: 'text',
        text_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,key' });

        if (error) throw error;
      }

      toast.success('Einstellungen gespeichert');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground mt-1 text-sm">E-Mail-Empfänger und Kontaktdaten verwalten</p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {/* Maintenance Mode */}
        <Card className={isMaintenanceMode ? 'border-yellow-500 bg-yellow-500/5' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5" />
              Wartungsmodus
            </CardTitle>
            <CardDescription>
              Schalten Sie die Webseite offline für Wartungsarbeiten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="maintenance_mode">Wartungsmodus aktivieren</Label>
                <p className="text-xs text-muted-foreground">
                  Besucher sehen eine Wartungsseite. Admins haben weiterhin Zugang.
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={isMaintenanceMode}
                onCheckedChange={handleMaintenanceToggle}
                disabled={maintenanceToggling}
              />
            </div>
            {isMaintenanceMode && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">
                  Die Webseite ist derzeit offline für Besucher!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-Mail Einstellungen
            </CardTitle>
            <CardDescription>
              E-Mail-Adressen für Buchungsanfragen und Kontaktformular
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking_email">Buchungsanfragen erhalten an</Label>
              <Input
                id="booking_email"
                type="email"
                value={settings.booking_email}
                onChange={(e) => setSettings(prev => ({ ...prev, booking_email: e.target.value }))}
                placeholder="buchung@pixelpalast.at"
              />
              <p className="text-xs text-muted-foreground">
                Alle Buchungsanfragen werden an diese E-Mail gesendet
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Kontaktanfragen erhalten an</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="kontakt@pixelpalast.at"
              />
              <p className="text-xs text-muted-foreground">
                Nachrichten vom Kontaktformular werden hierher gesendet
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontaktdaten
            </CardTitle>
            <CardDescription>
              Diese Daten werden im Footer und auf der Kontaktseite angezeigt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+43 660 1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Wien, Österreich"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Social Media
            </CardTitle>
            <CardDescription>
              Links zu Ihren Social-Media-Profilen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={settings.instagram}
                onChange={(e) => setSettings(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="https://instagram.com/pixelpalast"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                value={settings.facebook}
                onChange={(e) => setSettings(prev => ({ ...prev, facebook: e.target.value }))}
                placeholder="https://facebook.com/pixelpalast"
              />
            </div>
          </CardContent>
        </Card>

        {/* Google Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Google Analytics
            </CardTitle>
            <CardDescription>
              Tracking-ID für Website-Analysen (Besucher, Traffic-Quellen, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google_analytics_id">Measurement ID</Label>
              <Input
                id="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Finden Sie Ihre ID unter Google Analytics → Admin → Datenstreams → Web
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Passwort ändern
            </CardTitle>
            <CardDescription>
              Ändern Sie Ihr Admin-Passwort
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.email && (
              <div className="text-sm text-muted-foreground mb-4">
                Eingeloggt als: <span className="font-medium text-foreground">{user.email}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new_password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              onClick={handlePasswordChange} 
              disabled={changingPassword || !newPassword || !confirmPassword}
              variant="outline"
            >
              <Lock className="h-4 w-4 mr-2" />
              {changingPassword ? 'Wird geändert...' : 'Passwort ändern'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Speichern...' : 'Alle Einstellungen speichern'}
      </Button>
    </div>
  );
}
