# Migration Guide: Lovable Cloud → Vercel + Supabase

## Übersicht

Diese Anleitung führt dich durch die komplette Migration deines Pixelpalast-Projekts von Lovable Cloud zu einer selbst gehosteten Lösung mit Vercel (Frontend) und Supabase (Backend).

---

## Phase 1: Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle einen Account
2. Klicke auf "New Project"
3. Wähle einen Namen (z.B. `pixelpalast-prod`)
4. Setze ein sicheres Datenbank-Passwort
5. Wähle eine Region nahe deiner Zielgruppe (z.B. `eu-central-1` für Österreich)
6. Warte bis das Projekt erstellt ist (~2 Minuten)

### Wichtige Daten notieren:
- **Project URL**: `https://xxx.supabase.co`
- **Anon Key**: Unter Settings → API → `anon` `public`
- **Service Role Key**: Unter Settings → API → `service_role` (GEHEIM!)

---

## Phase 2: Datenbank-Schema importieren

1. Gehe im Supabase Dashboard zu **SQL Editor**
2. Klicke auf "New Query"
3. Kopiere den gesamten Inhalt von `01-complete-schema.sql`
4. Klicke auf "Run" (oder Cmd/Ctrl + Enter)

Das erstellt:
- ✅ 11 Tabellen
- ✅ 3 Database Functions
- ✅ 11 Triggers
- ✅ Alle RLS Policies
- ✅ 2 Storage Buckets

---

## Phase 3: Admin-Benutzer erstellen

1. Gehe zu **Authentication** → **Users**
2. Klicke auf "Add User" → "Create New User"
3. Trage ein:
   - Email: `office@pixelpalast.at`
   - Password: (sicheres Passwort)
   - ☑️ Auto Confirm User
4. Notiere dir die **User ID** des erstellten Benutzers

5. Gehe zum **SQL Editor** und führe aus:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('HIER-DIE-USER-ID-EINFÜGEN', 'admin');
```

---

## Phase 4: Edge Functions deployen

### Supabase CLI installieren

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (alle Plattformen)
npm install -g supabase
```

### Projekt verknüpfen

```bash
cd dein-projekt-ordner
supabase login
supabase link --project-ref DEINE-PROJECT-ID
```

### Functions deployen

```bash
supabase functions deploy analyze-receipt
supabase functions deploy chat-support
supabase functions deploy create-admin
supabase functions deploy generate-invoice-pdf
supabase functions deploy send-booking-email
supabase functions deploy send-invoice-email
```

---

## Phase 5: Secrets konfigurieren

Gehe im Supabase Dashboard zu **Edge Functions** → **Secrets** und füge hinzu:

| Secret Name | Beschreibung |
|-------------|--------------|
| `STRATO_SMTP_PASSWORD` | Passwort für SMTP Email-Versand |
| `RESEND_API_KEY` | API Key von resend.com |
| `LOVABLE_API_KEY` | API Key für AI-Funktionen |

**Hinweis**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY` werden automatisch von Supabase bereitgestellt.

---

## Phase 6: GitHub Repository vorbereiten

### .env Datei anpassen

Erstelle eine `.env.local` Datei (wird nicht committed):

```env
VITE_SUPABASE_URL=https://DEINE-PROJECT-ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=dein-anon-key
VITE_SUPABASE_PROJECT_ID=DEINE-PROJECT-ID
```

### .gitignore prüfen

Stelle sicher, dass `.env.local` in `.gitignore` steht.

---

## Phase 7: Vercel Deployment

1. Gehe zu [vercel.com](https://vercel.com) und logge dich ein
2. Klicke auf "Add New..." → "Project"
3. Importiere dein GitHub Repository
4. Vercel erkennt Vite automatisch

### Environment Variables in Vercel

Unter **Settings** → **Environment Variables** hinzufügen:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Dein Anon Key |
| `VITE_SUPABASE_PROJECT_ID` | Deine Project ID |

5. Klicke auf "Deploy"

---

## Phase 8: Domain konfigurieren (Optional)

### In Vercel:
1. Gehe zu deinem Projekt → **Settings** → **Domains**
2. Füge deine Domain hinzu (z.B. `pixelpalast.at`)
3. Konfiguriere die DNS-Einträge bei deinem Domain-Provider

### DNS-Einträge:
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

---

## Phase 9: Daten migrieren (Optional)

Falls du bestehende Daten übernehmen willst:

1. Exportiere die Daten aus dem alten Projekt
2. Importiere sie über den SQL Editor oder die Supabase API

---

## Checkliste

- [ ] Supabase Projekt erstellt
- [ ] Schema importiert
- [ ] Admin-Benutzer erstellt und Rolle zugewiesen
- [ ] Supabase CLI installiert
- [ ] Edge Functions deployed
- [ ] Secrets konfiguriert
- [ ] GitHub Repository mit neuen ENV Variablen
- [ ] Vercel Projekt erstellt
- [ ] Environment Variables in Vercel gesetzt
- [ ] Deployment erfolgreich
- [ ] Domain konfiguriert (optional)
- [ ] Login getestet
- [ ] Alle Funktionen getestet

---

## Troubleshooting

### "Invalid API key" Fehler
→ Prüfe ob `VITE_SUPABASE_PUBLISHABLE_KEY` korrekt in Vercel gesetzt ist

### Edge Functions geben 500 zurück
→ Prüfe die Logs: `supabase functions logs FUNCTION-NAME`
→ Prüfe ob alle Secrets gesetzt sind

### RLS Policy Fehler
→ Stelle sicher, dass der User eine Rolle in `user_roles` hat
→ Prüfe ob du eingeloggt bist

### Storage Upload schlägt fehl
→ Prüfe die Storage Policies im Dashboard
→ Stelle sicher, dass der Bucket existiert

---

## Support

Bei Fragen zur Migration:
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
