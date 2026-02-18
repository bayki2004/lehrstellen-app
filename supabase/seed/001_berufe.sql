-- ============================================================
-- SEED DATA: Swiss apprenticeship occupations (Berufe)
-- Source: SBFI/SERI official list, most popular Lehrstellen
-- ============================================================

INSERT INTO berufe (code, name_de, name_fr, name_it, field, education_type, description_de, personality_fit) VALUES

-- KAUFMÄNNISCH / COMMERCIAL
('68500', 'Kaufmann/-frau EFZ', 'Employé/e de commerce CFC', 'Impiegato/a di commercio AFC', 'Kaufmännisch', 'EFZ',
 'Kaufleute arbeiten in verschiedenen Branchen und erledigen administrative und organisatorische Aufgaben.',
 '{"realistic": 0.2, "investigative": 0.3, "artistic": 0.1, "social": 0.4, "enterprising": 0.5, "conventional": 0.8}'),

('68600', 'Kaufmann/-frau EBA', 'Employé/e de commerce AFP', 'Impiegato/a di commercio CFP', 'Kaufmännisch', 'EBA',
 'Kaufleute EBA unterstützen bei administrativen und organisatorischen Aufgaben in verschiedenen Branchen.',
 '{"realistic": 0.2, "investigative": 0.2, "artistic": 0.1, "social": 0.4, "enterprising": 0.4, "conventional": 0.8}'),

-- INFORMATIK / IT
('88611', 'Informatiker/in EFZ Applikationsentwicklung', 'Informaticien/ne CFC développement d''applications', 'Informatico/a AFC sviluppo di applicazioni', 'Informatik', 'EFZ',
 'Informatiker/innen Applikationsentwicklung entwickeln Software, programmieren Webseiten und Apps.',
 '{"realistic": 0.3, "investigative": 0.9, "artistic": 0.4, "social": 0.2, "enterprising": 0.3, "conventional": 0.5}'),

('88612', 'Informatiker/in EFZ Plattformentwicklung', 'Informaticien/ne CFC développement de plateformes', 'Informatico/a AFC sviluppo di piattaforme', 'Informatik', 'EFZ',
 'Informatiker/innen Plattformentwicklung bauen und betreiben IT-Infrastruktur und Netzwerke.',
 '{"realistic": 0.5, "investigative": 0.8, "artistic": 0.1, "social": 0.2, "enterprising": 0.3, "conventional": 0.6}'),

('88900', 'ICT-Fachmann/-frau EFZ', 'Agent/e en technologies numériques CFC', 'Operatore/trice in tecnologie digitali AFC', 'Informatik', 'EFZ',
 'ICT-Fachleute installieren, konfigurieren und warten Informatikmittel.',
 '{"realistic": 0.6, "investigative": 0.6, "artistic": 0.1, "social": 0.3, "enterprising": 0.2, "conventional": 0.5}'),

('88613', 'Mediamatiker/in EFZ', 'Médiamaticien/ne CFC', 'Mediamatico/a AFC', 'Informatik', 'EFZ',
 'Mediamatiker/innen gestalten Medieninhalte, pflegen Webseiten und erstellen Marketingmaterial.',
 '{"realistic": 0.2, "investigative": 0.5, "artistic": 0.8, "social": 0.4, "enterprising": 0.5, "conventional": 0.3}'),

-- GESUNDHEIT / HEALTH
('86914', 'Fachmann/-frau Gesundheit EFZ (FaGe)', 'Assistant/e en soins et santé communautaire CFC', 'Operatore/trice sociosanitario/a AFC', 'Gesundheit', 'EFZ',
 'FaGe pflegen und betreuen Patientinnen und Patienten in Spitälern, Heimen oder der Spitex.',
 '{"realistic": 0.4, "investigative": 0.3, "artistic": 0.1, "social": 0.9, "enterprising": 0.2, "conventional": 0.4}'),

('86916', 'Assistent/in Gesundheit und Soziales EBA (AGS)', 'Aide en soins et accompagnement AFP', 'Addetto/a alle cure sociosanitarie CFP', 'Gesundheit', 'EBA',
 'AGS unterstützen Fachpersonen bei der Betreuung und Pflege von Menschen.',
 '{"realistic": 0.4, "investigative": 0.2, "artistic": 0.1, "social": 0.9, "enterprising": 0.1, "conventional": 0.3}'),

('86930', 'Medizinische/r Praxisassistent/in EFZ', 'Assistant/e médical/e CFC', 'Assistente di studio medico AFC', 'Gesundheit', 'EFZ',
 'MPA arbeiten in Arztpraxen und erledigen medizinische und administrative Aufgaben.',
 '{"realistic": 0.3, "investigative": 0.4, "artistic": 0.1, "social": 0.8, "enterprising": 0.3, "conventional": 0.6}'),

-- DETAILHANDEL / RETAIL
('71300', 'Detailhandelsfachmann/-frau EFZ', 'Gestionnaire du commerce de détail CFC', 'Impiegato/a del commercio al dettaglio AFC', 'Detailhandel', 'EFZ',
 'Detailhandelsfachleute beraten Kunden, bewirtschaften Waren und gestalten Verkaufsflächen.',
 '{"realistic": 0.3, "investigative": 0.2, "artistic": 0.3, "social": 0.7, "enterprising": 0.7, "conventional": 0.4}'),

('71400', 'Detailhandelsassistent/in EBA', 'Assistant/e du commerce de détail AFP', 'Addetto/a del commercio al dettaglio CFP', 'Detailhandel', 'EBA',
 'Detailhandelsassistent/innen verkaufen Waren und kümmern sich um die Warenpräsentation.',
 '{"realistic": 0.3, "investigative": 0.1, "artistic": 0.2, "social": 0.7, "enterprising": 0.6, "conventional": 0.3}'),

-- TECHNIK / ENGINEERING
('45700', 'Polymechaniker/in EFZ', 'Polymécanicien/ne CFC', 'Polimeccanico/a AFC', 'Technik', 'EFZ',
 'Polymechaniker/innen fertigen Werkstücke, bauen Maschinen zusammen und führen Messungen durch.',
 '{"realistic": 0.9, "investigative": 0.6, "artistic": 0.1, "social": 0.2, "enterprising": 0.2, "conventional": 0.5}'),

('45800', 'Produktionsmechaniker/in EFZ', 'Mécanicien/ne de production CFC', 'Meccanico/a di produzione AFC', 'Technik', 'EFZ',
 'Produktionsmechaniker/innen fertigen Einzelteile und bearbeiten verschiedene Werkstoffe.',
 '{"realistic": 0.9, "investigative": 0.4, "artistic": 0.1, "social": 0.2, "enterprising": 0.1, "conventional": 0.5}'),

('47600', 'Automatiker/in EFZ', 'Automaticien/ne CFC', 'Operatore/trice in automazione AFC', 'Technik', 'EFZ',
 'Automatiker/innen entwickeln und bauen automatisierte Steuerungen und Anlagen.',
 '{"realistic": 0.7, "investigative": 0.8, "artistic": 0.1, "social": 0.2, "enterprising": 0.2, "conventional": 0.5}'),

('46500', 'Elektroinstallateur/in EFZ', 'Installateur-électricien/ne CFC', 'Installatore/trice elettricista AFC', 'Technik', 'EFZ',
 'Elektroinstallateur/innen planen und installieren elektrische Anlagen in Gebäuden.',
 '{"realistic": 0.9, "investigative": 0.4, "artistic": 0.1, "social": 0.3, "enterprising": 0.3, "conventional": 0.4}'),

-- HANDWERK / CRAFTS
('51700', 'Schreiner/in EFZ', 'Menuisier/ère CFC', 'Falegname AFC', 'Handwerk', 'EFZ',
 'Schreiner/innen stellen Möbel, Türen, Fenster und Innenausbauten aus Holz her.',
 '{"realistic": 0.9, "investigative": 0.3, "artistic": 0.6, "social": 0.2, "enterprising": 0.2, "conventional": 0.3}'),

('51200', 'Zimmermann/Zimmerin EFZ', 'Charpentier/ère CFC', 'Carpentiere/a AFC', 'Handwerk', 'EFZ',
 'Zimmerleute bauen Holzkonstruktionen für Gebäude, Brücken und Dachstühle.',
 '{"realistic": 0.9, "investigative": 0.3, "artistic": 0.3, "social": 0.3, "enterprising": 0.3, "conventional": 0.2}'),

-- BAU / CONSTRUCTION
('33200', 'Maurer/in EFZ', 'Maçon/ne CFC', 'Muratore/trice AFC', 'Bau', 'EFZ',
 'Maurer/innen errichten Mauerwerk, betonieren und verputzen Wände.',
 '{"realistic": 0.9, "investigative": 0.2, "artistic": 0.1, "social": 0.3, "enterprising": 0.2, "conventional": 0.3}'),

('34500', 'Zeichner/in EFZ Architektur', 'Dessinateur/trice CFC architecture', 'Disegnatore/trice AFC architettura', 'Bau', 'EFZ',
 'Zeichner/innen erstellen Pläne für Architektur- und Bauprojekte mit CAD-Software.',
 '{"realistic": 0.4, "investigative": 0.5, "artistic": 0.7, "social": 0.2, "enterprising": 0.2, "conventional": 0.6}'),

-- GASTRONOMIE / GASTRONOMY
('79000', 'Koch/Köchin EFZ', 'Cuisinier/ère CFC', 'Cuoco/a AFC', 'Gastronomie', 'EFZ',
 'Köche/Köchinnen bereiten Speisen zu, planen Menüs und bewirtschaften die Küche.',
 '{"realistic": 0.7, "investigative": 0.2, "artistic": 0.6, "social": 0.4, "enterprising": 0.3, "conventional": 0.3}'),

('79100', 'Restaurantfachmann/-frau EFZ', 'Spécialiste en restauration CFC', 'Impiegato/a di ristorazione AFC', 'Gastronomie', 'EFZ',
 'Restaurantfachleute bedienen Gäste, beraten bei der Menüwahl und organisieren den Service.',
 '{"realistic": 0.3, "investigative": 0.1, "artistic": 0.2, "social": 0.8, "enterprising": 0.6, "conventional": 0.3}'),

('21104', 'Bäcker/in-Konditor/in EFZ', 'Boulanger/ère-pâtissier/ère CFC', 'Panettiere/a-pasticciere/a AFC', 'Gastronomie', 'EFZ',
 'Bäcker/innen-Konditor/innen stellen Brot, Gebäck, Torten und Confiserie-Produkte her.',
 '{"realistic": 0.8, "investigative": 0.2, "artistic": 0.6, "social": 0.3, "enterprising": 0.3, "conventional": 0.4}'),

-- SOZIALES / SOCIAL
('94300', 'Fachmann/-frau Betreuung EFZ', 'Assistant/e socio-éducatif/ve CFC', 'Operatore/trice socioassistenziale AFC', 'Soziales', 'EFZ',
 'FaBe betreuen Kinder, Jugendliche, Menschen mit Beeinträchtigung oder betagte Menschen.',
 '{"realistic": 0.3, "investigative": 0.2, "artistic": 0.3, "social": 0.9, "enterprising": 0.2, "conventional": 0.3}'),

-- DESIGN / DESIGN
('64700', 'Grafiker/in EFZ', 'Graphiste CFC', 'Grafico/a AFC', 'Design', 'EFZ',
 'Grafiker/innen gestalten visuelle Kommunikationsmittel wie Plakate, Logos und Websites.',
 '{"realistic": 0.2, "investigative": 0.3, "artistic": 0.9, "social": 0.3, "enterprising": 0.3, "conventional": 0.3}'),

('64800', 'Interactive Media Designer EFZ', 'Interactive Media Designer CFC', 'Interactive Media Designer AFC', 'Design', 'EFZ',
 'Interactive Media Designer gestalten digitale Medienprodukte und Benutzeroberflächen.',
 '{"realistic": 0.2, "investigative": 0.5, "artistic": 0.9, "social": 0.3, "enterprising": 0.3, "conventional": 0.3}'),

-- LOGISTIK / LOGISTICS
('95600', 'Logistiker/in EFZ', 'Logisticien/ne CFC', 'Impiegato/a in logistica AFC', 'Logistik', 'EFZ',
 'Logistiker/innen nehmen Güter an, kontrollieren, lagern und verteilen sie.',
 '{"realistic": 0.7, "investigative": 0.2, "artistic": 0.1, "social": 0.3, "enterprising": 0.3, "conventional": 0.7}'),

('95700', 'Logistiker/in EBA', 'Logisticien/ne AFP', 'Addetto/a alla logistica CFP', 'Logistik', 'EBA',
 'Logistiker/innen EBA arbeiten in Lagern und transportieren Güter.',
 '{"realistic": 0.8, "investigative": 0.1, "artistic": 0.1, "social": 0.2, "enterprising": 0.2, "conventional": 0.6}'),

-- NATUR / NATURE
('17000', 'Gärtner/in EFZ', 'Horticulteur/trice CFC', 'Giardiniere/a AFC', 'Natur', 'EFZ',
 'Gärtner/innen pflegen Pflanzen, gestalten Gärten und Grünanlagen.',
 '{"realistic": 0.9, "investigative": 0.3, "artistic": 0.5, "social": 0.2, "enterprising": 0.2, "conventional": 0.2}'),

('15000', 'Landwirt/in EFZ', 'Agriculteur/trice CFC', 'Agricoltore/trice AFC', 'Natur', 'EFZ',
 'Landwirt/innen bewirtschaften einen Bauernhof und produzieren Nahrungsmittel.',
 '{"realistic": 0.9, "investigative": 0.3, "artistic": 0.1, "social": 0.2, "enterprising": 0.5, "conventional": 0.3}')

ON CONFLICT (code) DO NOTHING;
