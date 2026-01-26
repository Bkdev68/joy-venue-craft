
# Google Kalender Integration für PixelPalast

## Übersicht

Implementierung einer bidirektionalen Synchronisierung zwischen dem PixelPalast Admin-Kalender und einem zentralen Google Kalender. Alle Mitarbeiter können diesen Kalender abonnieren – unabhängig davon ob sie Google Kalender oder iCloud nutzen.

## Voraussetzungen (von dir)

1. **Google Cloud Projekt erstellen**
   - Gehe zu console.cloud.google.com
   - Neues Projekt erstellen (z.B. "PixelPalast Kalender")

2. **Service Account erstellen**
   - APIs & Services → Credentials → Service Account erstellen
   - JSON-Key herunterladen

3. **Google Calendar API aktivieren**
   - APIs & Services → Library → "Google Calendar API" suchen und aktivieren

4. **Kalender teilen**
   - Im Google Kalender: Einstellungen → Kalender teilen
   - Die Service Account E-Mail (aus dem JSON) als "Kann Termine bearbeiten" hinzufügen

## Implementierung

### 1. Datenbank-Erweiterung

Neue Spalte in der `bookings` Tabelle:
- `google_calendar_event_id` (text) - Speichert die Google Event ID für Updates/Löschungen

### 2. Edge Function: `google-calendar-sync`

Neue Backend-Funktion für die Synchronisierung:

**Funktionen:**
- Termine erstellen bei Buchungsbestätigung
- Termine aktualisieren bei Änderungen
- Termine löschen bei Stornierung

**Event-Details im Kalender:**
- Titel: Kundenname + Event-Typ
- Beschreibung: Paket, Preis, Kontaktdaten, Nachricht
- Uhrzeit: Event-Zeit aus der Buchung
- Ort: Venue aus der Buchung
- Zugewiesene Mitarbeiter in der Beschreibung

### 3. Automatische Synchronisierung

Bei Statusänderungen in `AdminBookings.tsx`:
- `pending` → `confirmed`: Termin im Google Kalender erstellen
- Buchung bearbeitet: Termin aktualisieren
- Buchung storniert/gelöscht: Termin aus Kalender entfernen (optional)

### 4. Rückwärts-Sync (Änderungen im Google Kalender)

Regelmäßiger Check oder Webhook:
- Änderungen an Datum/Uhrzeit zurück in die App übernehmen
- Gelöschte Termine erkennen

## Architektur

```text
Admin-Panel                          Google Calendar
+-----------------+                  +------------------+
| Buchung         |                  | PixelPalast      |
| bestätigen      |                  | Kalender         |
+--------+--------+                  +--------+---------+
         |                                    ^
         v                                    |
+--------+--------+                           |
| Edge Function   |------ API Call -----------+
| google-calendar |
| -sync           |
+-----------------+

         Mitarbeiter abonnieren:
         +-------------+    +-------------+
         | Google      |    | iCloud      |
         | Kalender    |    | Kalender    |
         +-------------+    +-------------+
```

## Benötigte Secrets

| Secret | Beschreibung |
|--------|--------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | E-Mail des Service Accounts |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Private Key aus dem JSON |
| `GOOGLE_CALENDAR_ID` | ID des PixelPalast Kalenders |

## Dateien

### Neu erstellen

| Datei | Beschreibung |
|-------|--------------|
| `supabase/functions/google-calendar-sync/index.ts` | Edge Function für die Sync |

### Ändern

| Datei | Änderung |
|-------|----------|
| `bookings` Tabelle | Neue Spalte `google_calendar_event_id` |
| `src/pages/admin/AdminBookings.tsx` | Sync bei Statusänderung auslösen |
| `src/pages/admin/AdminKalender.tsx` | Sync-Status anzeigen |

## Für die Mitarbeiter

Nachdem alles eingerichtet ist:

**Google Kalender Nutzer:**
- Kalender → Andere Kalender → Per URL abonnieren
- URL vom PixelPalast Google Kalender einfügen

**iCloud Nutzer:**
- Kalender → Datei → Neues Kalenderabonnement
- iCal-URL vom Google Kalender einfügen (öffentliche Adresse)

## Nächste Schritte nach Genehmigung

1. Du erstellst das Google Cloud Projekt und Service Account
2. Ich füge die Datenbankänderungen hinzu
3. Ich implementiere die Edge Function
4. Ich integriere die Sync-Aufrufe in den Admin-Bereich
5. Ich füge eine Anleitung für die Mitarbeiter hinzu
