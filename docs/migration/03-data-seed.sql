-- ============================================
-- PIXELPALAST DATA SEED SCRIPT
-- Run this in your standalone Supabase SQL Editor
-- AFTER running the schema migration (01-complete-schema.sql)
-- ============================================

-- ============================================
-- 1. SERVICES
-- ============================================
INSERT INTO public.services (id, title, slug, short_description, price_from, features, is_active, sort_order) VALUES
('0238f40c-e9e6-4245-bf47-c7320c55dfef', 'Photo Booth', 'photobooth', 'Klassischer Photobooth mit professioneller Fotoqualität', 390, '["Sofortdruck", "Digitale Galerie", "Requisiten-Paket", "Individuelles Layout"]', true, 0),
('1a62020b-0ce4-498a-8506-59a0f3ea2e5c', '360° Video Booth', '360-video-booth', 'Spektakuläre 360-Grad-Videos für Ihr Event', 490, '["Slow-Motion Effekte", "Sofortiger Download", "Social-Media-Ready", "Professionelle Beleuchtung"]', true, 1),
('a5ea2556-18b0-4e99-9c73-59d6d2e72fe3', 'Audio Gästebuch', 'audio-gaestebuch', 'Persönliche Sprachnachrichten als Erinnerung', 290, '["Retro-Telefon Design", "Unbegrenzte Nachrichten", "USB-Stick mit Aufnahmen", "Optional: gedrucktes Gästebuch"]', true, 2),
('19a866b6-ec08-46dc-bce1-e136b5ae1f19', 'Photo Both + 360° Video Booth', 'photo-booth-360-video-booth', NULL, 690, '["Photo Both + 360° Video Booth"]', true, 3);

-- ============================================
-- 2. PACKAGES
-- ============================================
INSERT INTO public.packages (id, name, description, duration, price, base_price, hourly_rate, features, service_id, is_active, is_popular, sort_order) VALUES
-- Photo Booth Packages
('b27eb93f-823b-4a44-9329-ceae3a13f4dd', 'Starter', '2 Stunden Photobooth-Erlebnis', '2 Stunden', 390, 390, 0, '["Unbegrenzte Fotos", "Sofortdruck", "Digitale Galerie"]', '0238f40c-e9e6-4245-bf47-c7320c55dfef', true, false, 0),
('1d2e5b4a-6ffc-4bf1-a4b8-09fc268511a9', 'Classic', '4 Stunden Photobooth-Erlebnis', '4 Stunden', 590, 590, 0, '["Unbegrenzte Fotos", "Sofortdruck", "Digitale Galerie", "Premium Requisiten"]', '0238f40c-e9e6-4245-bf47-c7320c55dfef', true, true, 1),
('6fd7f85b-d23e-4bc7-85b8-2c3af29fce54', 'Premium', '6 Stunden Photobooth-Erlebnis', '6 Stunden', 790, 790, 0, '["Unbegrenzte Fotos", "Sofortdruck", "Digitale Galerie", "Premium Requisiten", "Gästebuch"]', '0238f40c-e9e6-4245-bf47-c7320c55dfef', true, false, 2),

-- 360° Video Booth Packages
('bdb96bba-e52c-472b-959d-2f9121737938', 'Starter', '2 Stunden 360° Video', '2 Stunden', 490, 490, 0, '["Unbegrenzte Videos", "Sofort-Download", "Social Media Ready"]', '1a62020b-0ce4-498a-8506-59a0f3ea2e5c', true, false, 0),
('a605797c-c061-4211-a2ed-c9c4bae7f13a', 'Classic', '4 Stunden 360° Video', '4 Stunden', 790, 790, 0, '["Unbegrenzte Videos", "Sofort-Download", "Social Media Ready", "Slow-Motion Effekte"]', '1a62020b-0ce4-498a-8506-59a0f3ea2e5c', true, true, 1),
('c1547436-8b15-49e3-8f1a-d51c1e03fc05', 'Premium', '6 Stunden 360° Video', '6 Stunden', 1090, 1090, 0, '["Unbegrenzte Videos", "Sofort-Download", "Social Media Ready", "Slow-Motion Effekte", "VIP Setup"]', '1a62020b-0ce4-498a-8506-59a0f3ea2e5c', true, false, 2),

-- Audio Gästebuch Package
('4652240a-141e-4780-9521-44d023efc808', 'Komplett-Paket', 'Ganztägiges Audio Gästebuch', 'Ganzer Tag', 290, 290, 0, '["Retro-Telefon", "Unbegrenzte Nachrichten", "USB-Stick", "Digitale Kopie"]', 'a5ea2556-18b0-4e99-9c73-59d6d2e72fe3', true, true, 0),

-- Combo Package
('941e3082-0696-411c-9b9b-d0a93fdc036d', 'Individuell', NULL, 'auf anfrage', 590, 590, 0, '[]', '19a866b6-ec08-46dc-bce1-e136b5ae1f19', true, true, 0);

-- ============================================
-- 3. TESTIMONIALS
-- ============================================
INSERT INTO public.testimonials (id, name, role, company, content, rating, is_active, sort_order) VALUES
('eec540f4-c897-4596-999c-a4c73a1f1ace', 'Maria & Thomas', 'Brautpaar', 'Hochzeit', 'Pixelpalast hat unsere Hochzeit unvergesslich gemacht! Die Fotos waren wunderschön und das Team super professionell.', 5, true, 0),
('474b7ed8-9d5c-4043-933c-ab983a453fad', 'Stefan K.', 'Eventmanager', 'Firmenevent', 'Der 360° Video Booth war das absolute Highlight unserer Firmenfeier. Alle Gäste waren begeistert!', 5, true, 1),
('cd855630-4584-42be-a219-dc0a979663d2', 'Julia M.', 'Gastgeberin', 'Geburtstag', 'Perfekter Service von Anfang bis Ende. Die individuellen Layouts passten perfekt zu unserem Motto.', 5, true, 2);

-- ============================================
-- 4. FAQs
-- ============================================
INSERT INTO public.faqs (id, question, answer, category, is_active, sort_order) VALUES
('f2b7fd46-debb-42df-ab80-9029d5cc6470', 'Wie weit im Voraus sollte ich buchen?', 'Wir empfehlen 4-6 Wochen, für Hochzeiten 3-6 Monate Vorlaufzeit.', 'Buchung', true, 0),
('63e1222e-3418-4fe7-9cbe-7968695fd34e', 'Ist die Anfahrt im Preis enthalten?', 'Ja, für Wien und Umkreis 50km. Darüber €0,50/km.', 'Preise', true, 1),
('f52476d6-3fd6-404b-a94e-00c23d952fca', 'Wie lange dauert der Auf-/Abbau?', 'Aufbau ca. 45-60 Min, Abbau ca. 30 Min – nicht in Buchungszeit enthalten.', 'Service', true, 2),
('5a50ae50-7a0a-4ebf-93f6-14fa9e165998', 'Wann erhalte ich die Dateien?', 'Sofortversand vor Ort, Online-Galerie in 24-48 Stunden.', 'Service', true, 3),
('83b6d877-a4b9-4ee9-8cad-15cffb6be4a9', 'Kann ich Pakete anpassen?', 'Ja, kontaktieren Sie uns für individuelle Angebote.', 'Buchung', true, 4),
('4df71548-abc1-4a66-a50d-dbf524daa0b2', 'Wie erfolgt die Bezahlung?', '30% Anzahlung bei Buchung, Rest 7 Tage vor dem Event.', 'Preise', true, 5);

-- ============================================
-- 5. SITE CONTENT (Settings & CMS Content)
-- ============================================
INSERT INTO public.site_content (section, key, text_value, content_type) VALUES
-- Settings
('settings', 'booking_email', 'office@pixelpalast.at', 'text'),
('settings', 'contact_email', 'office@pixelpalast.at', 'text'),
('settings', 'phone', '+43 660 1234567', 'text'),
('settings', 'address', 'Wien, Österreich', 'text'),
('settings', 'instagram', 'https://instagram.com/pixelpalast', 'text'),
('settings', 'facebook', 'https://facebook.com/pixelpalast', 'text'),

-- Hero Section
('hero', 'subtitle', 'Photobooth & 360° Video', 'text'),
('hero', 'title_line1', 'Unvergessliche', 'text'),
('hero', 'title_line2', 'Erinnerungen', 'text'),
('hero', 'description', 'Professioneller Photobooth & 360° Video Service für Events, die in Erinnerung bleiben.', 'text'),
('hero', 'cta_primary', 'Jetzt buchen', 'text'),
('hero', 'cta_secondary', 'Galerie ansehen', 'text'),

-- Stats
('stats', 'stat1_value', '500+', 'text'),
('stats', 'stat1_label', 'Events', 'text'),
('stats', 'stat2_value', '100%', 'text'),
('stats', 'stat2_label', 'Zufriedenheit', 'text'),
('stats', 'stat3_value', 'Wien', 'text'),
('stats', 'stat3_label', '& Umgebung', 'text'),

-- Services Section
('services_section', 'subtitle', 'Services', 'text'),
('services_section', 'title', 'Was wir bieten', 'text'),
('services_section', 'description', 'Eine perfekt auf Sie zugeschnittene Auswahl an Photobooth und 360° Video Services.', 'text'),
('services_section', 'button_text', 'Alle Leistungen', 'text');

-- ============================================
-- DONE! 
-- Your database now has all the seed data.
-- ============================================
