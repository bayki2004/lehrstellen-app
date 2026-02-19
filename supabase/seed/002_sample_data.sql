-- ============================================================
-- SAMPLE DATA: Companies and Lehrstellen for development/demo
-- Note: These use hardcoded UUIDs so they can be referenced
-- In production, companies register via the dashboard
-- ============================================================

-- Sample Companies (using auth.users bypass for seed data)
-- In production, companies register through the web dashboard

INSERT INTO companies (id, auth_user_id, company_name, industry, canton, city, postal_code, website_url, description, company_size, culture_tags, culture_description, contact_person, contact_email, verified, premium, data_source) VALUES

('a1000000-0000-0000-0000-000000000001'::uuid, NULL,
 'Swisscom AG', 'Telekommunikation', 'ZH', 'Zürich', '8005',
 'https://www.swisscom.ch', 'Die Swisscom ist das führende Telekommunikationsunternehmen der Schweiz.',
 'large', '["Innovation", "Teamwork", "Flexibel", "Modern", "Nachhaltigkeit"]',
 'Innovation, Teamwork und Nachhaltigkeit sind unsere Werte. Bei uns arbeitest du mit modernster Technologie.',
 'Sarah Müller', 'lehrstellen@swisscom.com', true, true, 'seed'),

('a1000000-0000-0000-0000-000000000002'::uuid, NULL,
 'Universitätsspital Zürich', 'Gesundheit', 'ZH', 'Zürich', '8091',
 'https://www.usz.ch', 'Das USZ ist eines der grössten und bedeutendsten Spitäler der Schweiz.',
 'large', '["Gesundheit", "Menschen helfen", "Vielseitig", "Modern", "Forschung"]',
 'Menschlichkeit, Professionalität und Innovation in der Medizin.',
 'Thomas Weber', 'ausbildung@usz.ch', true, true, 'seed'),

('a1000000-0000-0000-0000-000000000003'::uuid, NULL,
 'SBB CFF FFS', 'Verkehr', 'BE', 'Bern', '3000',
 'https://www.sbb.ch', 'Die SBB bewegt die Schweiz — als grösste Reise- und Transportfirma.',
 'large', '["Mobilität", "Teamwork", "Sicherheit", "Innovation", "Vielfalt"]',
 'Bei uns bewegt sich was! Werde Teil eines Teams, das die Schweiz verbindet.',
 'Anna Schneider', 'berufsbildung@sbb.ch', true, true, 'seed'),

('a1000000-0000-0000-0000-000000000004'::uuid, NULL,
 'Bäckerei Müller', 'Gastronomie', 'BE', 'Bern', '3011',
 'https://www.baeckerei-mueller.ch', 'Traditionelle Bäckerei seit 1956. Handwerk mit Leidenschaft.',
 'small', '["Familiär", "Handwerk", "Tradition", "Frühaufsteher"]',
 'Familiäres Umfeld, Handwerkskunst — bei uns lernst du ein echtes Handwerk!',
 'Peter Müller', 'info@baeckerei-mueller.ch', true, false, 'seed'),

('a1000000-0000-0000-0000-000000000005'::uuid, NULL,
 'Roche', 'Pharma', 'BS', 'Basel', '4058',
 'https://www.roche.ch', 'Roche ist ein weltweit führendes Gesundheitsunternehmen.',
 'large', '["Forschung", "Innovation", "International", "Nachhaltigkeit"]',
 'Bei Roche arbeitest du an Lösungen, die das Leben von Menschen verbessern.',
 'Lisa Brunner', 'apprenticeships@roche.com', true, true, 'seed'),

('a1000000-0000-0000-0000-000000000006'::uuid, NULL,
 'Migros-Genossenschafts-Bund', 'Detailhandel', 'ZH', 'Zürich', '8005',
 'https://www.migros.ch', 'Die Migros ist die grösste Detailhändlerin der Schweiz.',
 'large', '["Vielfalt", "Teamwork", "Nahbar", "Nachhaltigkeit"]',
 'Bei der Migros erwartet dich ein abwechslungsreicher Alltag mit vielen Möglichkeiten.',
 'Marco Keller', 'berufsbildung@migros.ch', true, true, 'seed'),

('a1000000-0000-0000-0000-000000000007'::uuid, NULL,
 'Schreinerei Holzweg GmbH', 'Handwerk', 'AG', 'Aarau', '5000',
 NULL, 'Moderne Schreinerei mit Tradition. Wir fertigen massgeschneiderte Möbel und Innenausbauten.',
 'small', '["Handwerk", "Kreativ", "Familiär", "Holz"]',
 'Bei uns lernst du den Werkstoff Holz von A bis Z kennen. Kreativität trifft Handwerk.',
 'Beat Zimmermann', 'lehrstelle@holzweg.ch', true, false, 'seed'),

('a1000000-0000-0000-0000-000000000008'::uuid, NULL,
 'Stadt Zürich - Informatik', 'Öffentliche Verwaltung', 'ZH', 'Zürich', '8001',
 'https://www.stadt-zuerich.ch', 'Die Stadt Zürich bietet vielfältige Ausbildungsplätze in der IT.',
 'large', '["Service Public", "Modern", "Vielfalt", "Work-Life-Balance"]',
 'IT im Service Public: Moderne Technologie für die Bevölkerung der grössten Stadt der Schweiz.',
 'Sandra Fischer', 'informatik-lehrstellen@zuerich.ch', true, false, 'seed')

ON CONFLICT (id) DO NOTHING;


-- Sample Lehrstellen
INSERT INTO lehrstellen (id, company_id, beruf_code, title, description, requirements, education_type, start_date, duration_years, canton, city, postal_code, status, culture_description) VALUES

('b1000000-0000-0000-0000-000000000001'::uuid,
 'a1000000-0000-0000-0000-000000000001'::uuid,
 '88611', 'Informatiker/in EFZ Applikationsentwicklung',
 'Lerne bei uns, wie man moderne Apps und Webservices entwickelt. Du arbeitest in einem dynamischen Team und setzt echte Projekte um. Vom ersten Tag an bist du Teil der digitalen Zukunft der Schweiz.',
 '["Sek A / Niveau E", "Gute Noten in Mathe und Englisch", "Interesse an Technologie und Programmieren", "Logisches Denken"]',
 'EFZ', '2027-08-01', 4, 'ZH', 'Zürich', '8005', 'active',
 'Flexible Arbeitszeiten, modernes Büro, eigenes MacBook, interne Hackathons.'),

('b1000000-0000-0000-0000-000000000002'::uuid,
 'a1000000-0000-0000-0000-000000000001'::uuid,
 '88613', 'Mediamatiker/in EFZ',
 'Als Mediamatiker/in bei Swisscom verbindest du Kreativität mit Technologie. Du gestaltest Medieninhalte, erstellst Videos und pflegst unsere digitalen Kanäle.',
 '["Sek A oder gute Sek B", "Kreativität", "Interesse an Social Media und Design", "Teamfähigkeit"]',
 'EFZ', '2027-08-01', 4, 'ZH', 'Zürich', '8005', 'active',
 'Kreatives Team, eigenes Equipment, Möglichkeit für eigene Projekte.'),

('b1000000-0000-0000-0000-000000000003'::uuid,
 'a1000000-0000-0000-0000-000000000002'::uuid,
 '86914', 'Fachfrau/-mann Gesundheit EFZ (FaGe)',
 'Pflege Menschen und mache einen Unterschied. Am USZ erwartet dich ein vielseitiger Ausbildungsplatz mit modernster Infrastruktur und einem engagierten Ausbildungsteam.',
 '["Sek A oder B", "Empathie und Einfühlungsvermögen", "Teamfähigkeit", "Belastbarkeit", "Gute Deutschkenntnisse"]',
 'EFZ', '2027-08-01', 3, 'ZH', 'Zürich', '8091', 'active',
 'Rotation durch verschiedene Abteilungen, Mentoring-Programm, Weiterbildungsmöglichkeiten.'),

('b1000000-0000-0000-0000-000000000004'::uuid,
 'a1000000-0000-0000-0000-000000000003'::uuid,
 '45700', 'Polymechaniker/in EFZ',
 'Bei der SBB hältst du die Schweiz in Bewegung! Als Polymechaniker/in fertigst du präzise Werkstücke für unsere Züge und Infrastruktur.',
 '["Sek A", "Gute Noten in Mathe und Physik", "Handwerkliches Geschick", "Interesse an Technik"]',
 'EFZ', '2027-08-01', 4, 'BE', 'Bern', '3000', 'active',
 'Modernste Werkstätten, Gratis-GA während der Lehre, starkes Lehrlingsnetzwerk.'),

('b1000000-0000-0000-0000-000000000005'::uuid,
 'a1000000-0000-0000-0000-000000000004'::uuid,
 '21104', 'Bäcker/in-Konditor/in EFZ',
 'Werde Teil unserer Familientradition! Seit 1956 backen wir mit Leidenschaft. Lerne das Handwerk von Grund auf und kreiere Köstlichkeiten, die Menschen glücklich machen.',
 '["Sek B", "Teamfähigkeit", "Frühaufsteher (Arbeitsbeginn 04:00)", "Freude am Handwerk"]',
 'EFZ', '2027-08-01', 3, 'BE', 'Bern', '3011', 'active',
 'Familiäre Atmosphäre, eigene Kreationen erwünscht, alle Backwaren gratis für Lernende.'),

('b1000000-0000-0000-0000-000000000006'::uuid,
 'a1000000-0000-0000-0000-000000000005'::uuid,
 '68500', 'Kauffrau/-mann EFZ',
 'Bei Roche erlebst du die internationale Pharma-Welt hautnah. Du arbeitest in verschiedenen Abteilungen und lernst globale Geschäftsprozesse kennen.',
 '["Sek A / Niveau E oder P", "Gute Sprachkenntnisse (DE + EN)", "Interesse an Naturwissenschaften", "Organisationstalent"]',
 'EFZ', '2027-08-01', 3, 'BS', 'Basel', '4058', 'active',
 'Internationales Umfeld, Sprachaufenthalte möglich, eigenes Roche-Lernenden-Programm.'),

('b1000000-0000-0000-0000-000000000007'::uuid,
 'a1000000-0000-0000-0000-000000000006'::uuid,
 '71300', 'Detailhandelsfachfrau/-mann EFZ',
 'Bei der Migros lernst du alles rund um den Detailhandel. Von der Warenpräsentation bis zur Kundenberatung — kein Tag ist wie der andere.',
 '["Sek A oder B", "Freude am Umgang mit Menschen", "Teamfähigkeit", "Zuverlässigkeit"]',
 'EFZ', '2027-08-01', 3, 'ZH', 'Zürich', '8005', 'active',
 'Abwechslungsreicher Alltag, Mitarbeiterrabatte, gute Übernahmechancen.'),

('b1000000-0000-0000-0000-000000000008'::uuid,
 'a1000000-0000-0000-0000-000000000007'::uuid,
 '51700', 'Schreiner/in EFZ',
 'Bei uns lernst du den Werkstoff Holz von A bis Z. Von der Skizze bis zum fertigen Möbelstück — du bist bei jedem Schritt dabei.',
 '["Sek B", "Handwerkliches Geschick", "Räumliches Vorstellungsvermögen", "Interesse an Holz und Design"]',
 'EFZ', '2027-08-01', 4, 'AG', 'Aarau', '5000', 'active',
 'Kleine Werkstatt, grosse Projekte. Vom Einzelstück bis zur Küche — alles handgefertigt.'),

('b1000000-0000-0000-0000-000000000009'::uuid,
 'a1000000-0000-0000-0000-000000000008'::uuid,
 '88611', 'Informatiker/in EFZ Applikationsentwicklung',
 'Entwickle Software, die das Leben der Zürcher Bevölkerung verbessert. Von E-Government-Portalen bis zu internen Tools — deine Arbeit hat Impact.',
 '["Sek A", "Interesse an Programmieren", "Logisches Denkvermögen", "Teamfähigkeit"]',
 'EFZ', '2027-08-01', 4, 'ZH', 'Zürich', '8001', 'active',
 'Sinnvolle Arbeit für die Gemeinschaft, flexible Arbeitszeiten, zentrale Lage.'),

('b1000000-0000-0000-0000-000000000010'::uuid,
 'a1000000-0000-0000-0000-000000000002'::uuid,
 '86930', 'Medizinische/r Praxisassistent/in EFZ',
 'Am USZ arbeitest du in einer der modernsten Kliniken der Schweiz. Du lernst medizinische und administrative Aufgaben in verschiedenen Fachbereichen.',
 '["Sek A oder gute Sek B", "Interesse an Medizin", "Sorgfalt und Genauigkeit", "Freundliches Auftreten"]',
 'EFZ', '2027-08-01', 3, 'ZH', 'Zürich', '8091', 'active',
 'Einblick in verschiedene medizinische Fachgebiete, Weiterbildungsunterstützung.')

ON CONFLICT (id) DO NOTHING;
