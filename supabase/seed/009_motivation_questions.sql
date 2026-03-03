-- =============================================================================
-- Seed: Motivation Questions for Lehrstellen (per Berufsfeld)
-- =============================================================================
-- Each lehrstelle gets 3 field-specific questions that companies would want
-- students to answer during the Bewerbung (application) process.
-- Format: JSONB array of {question: string, placeholder?: string}
-- =============================================================================

-- Informatik
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was fasziniert Sie an der Informatik und warum möchten Sie diesen Beruf erlernen?", "placeholder": "z.B. eigene Projekte, Interesse an Technologie..."},
  {"question": "Beschreiben Sie ein Projekt oder eine Erfahrung mit Technik oder Programmierung, die Sie begeistert hat.", "placeholder": "z.B. Schulprojekt, eigene Website, Robotik-Kurs..."},
  {"question": "Wie stellen Sie sich Ihren Arbeitsalltag in der IT vor und was möchten Sie in der Lehre lernen?", "placeholder": "z.B. Teamarbeit, neue Technologien, Problemlösung..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Informatik');

-- Wirtschaft/Verwaltung
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was reizt Sie an der kaufmännischen Arbeit und warum haben Sie sich für diesen Beruf entschieden?", "placeholder": "z.B. Organisation, Kommunikation, Büroarbeit..."},
  {"question": "Wie organisieren Sie sich im Alltag, wenn mehrere Aufgaben gleichzeitig anstehen?", "placeholder": "z.B. To-Do-Listen, Priorisierung, digitale Tools..."},
  {"question": "Was möchten Sie während Ihrer kaufmännischen Ausbildung lernen und erreichen?", "placeholder": "z.B. Buchhaltung, Kundenbetreuung, Sprachen..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Wirtschaft/Verwaltung');

-- Gesundheit
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Warum möchten Sie einen Beruf im Gesundheitswesen erlernen?", "placeholder": "z.B. Menschen helfen, medizinisches Interesse..."},
  {"question": "Welche Eigenschaften bringen Sie mit, die für die Arbeit mit Patienten wichtig sind?", "placeholder": "z.B. Einfühlungsvermögen, Geduld, Teamfähigkeit..."},
  {"question": "Wie gehen Sie mit stressigen oder emotional belastenden Situationen um?", "placeholder": "z.B. Gespräche, Sport, ruhig bleiben..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Gesundheit');

-- Elektrotechnik
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was begeistert Sie an der Elektrotechnik und warum möchten Sie in diesem Bereich arbeiten?", "placeholder": "z.B. Technik, Elektronik, praktisches Arbeiten..."},
  {"question": "Erzählen Sie von einer handwerklichen oder technischen Tätigkeit, die Ihnen Spass gemacht hat.", "placeholder": "z.B. etwas repariert, gebaut, ausprobiert..."},
  {"question": "Welche Fähigkeiten möchten Sie in der Elektrotechnik-Ausbildung entwickeln?", "placeholder": "z.B. Schaltpläne lesen, Installationen, Sicherheit..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Elektrotechnik');

-- Gastgewerbe
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was begeistert Sie an der Gastronomie und warum möchten Sie in diesem Bereich arbeiten?", "placeholder": "z.B. Kochen, Gästebetreuung, Kreativität..."},
  {"question": "Wie gehen Sie damit um, wenn es hektisch wird und viele Gäste gleichzeitig bedient werden müssen?", "placeholder": "z.B. Ruhe bewahren, Prioritäten setzen, Teamwork..."},
  {"question": "Was möchten Sie in der Gastronomie-Ausbildung lernen und erreichen?", "placeholder": "z.B. neue Rezepte, Servicequalität, eigenes Restaurant..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Gastgewerbe');

-- Gestaltung/Kunsthandwerk
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was inspiriert Sie an gestalterischer oder kunsthandwerklicher Arbeit?", "placeholder": "z.B. Kreativität, Design, Materialien..."},
  {"question": "Zeigen Sie uns ein Beispiel Ihrer kreativen Arbeit oder beschreiben Sie ein Projekt, auf das Sie stolz sind.", "placeholder": "z.B. Zeichnungen, Bastelprojekte, digitale Designs..."},
  {"question": "Welche gestalterischen Fähigkeiten möchten Sie in der Ausbildung weiterentwickeln?", "placeholder": "z.B. Zeichnen, 3D-Modellierung, Farbenlehre..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Gestaltung/Kunsthandwerk');

-- Bau
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was fasziniert Sie am Bauwesen und warum möchten Sie auf dem Bau arbeiten?", "placeholder": "z.B. draussen arbeiten, etwas Bleibendes schaffen..."},
  {"question": "Erzählen Sie von einer handwerklichen Tätigkeit, die Ihnen Spass gemacht hat.", "placeholder": "z.B. etwas gebaut, renoviert, repariert..."},
  {"question": "Welche Fähigkeiten möchten Sie auf der Baustelle lernen?", "placeholder": "z.B. Maschinen bedienen, Pläne lesen, Teamarbeit..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Bau');

-- Metall/Maschinen/Uhren
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was fasziniert Sie an der Arbeit mit Metall, Maschinen oder in der Uhrenindustrie?", "placeholder": "z.B. Präzision, Technik, Materialbearbeitung..."},
  {"question": "Beschreiben Sie eine Erfahrung, bei der Genauigkeit und Sorgfalt besonders wichtig waren.", "placeholder": "z.B. Modellbau, technisches Zeichnen, Reparaturen..."},
  {"question": "Was möchten Sie in Ihrer Ausbildung im Bereich Metall/Maschinen lernen?", "placeholder": "z.B. CNC-Fräsen, Schweissen, technische Zeichnungen..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Metall/Maschinen/Uhren');

-- Verkauf/Einkauf
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was reizt Sie am Verkauf oder Einkauf und warum möchten Sie in diesem Bereich arbeiten?", "placeholder": "z.B. Kundenkontakt, Beratung, Produkte..."},
  {"question": "Wie würden Sie einem Kunden ein Produkt empfehlen, das er noch nicht kennt?", "placeholder": "z.B. Bedürfnisse erfragen, Vorteile erklären, zuhören..."},
  {"question": "Welche Fähigkeiten möchten Sie im Bereich Verkauf/Einkauf entwickeln?", "placeholder": "z.B. Verhandeln, Warenpräsentation, Kundenservice..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Verkauf/Einkauf');

-- Verkehr/Logistik
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was interessiert Sie an Verkehr und Logistik und warum möchten Sie in diesem Bereich arbeiten?", "placeholder": "z.B. Transport, Organisation, Technik..."},
  {"question": "Wie gehen Sie vor, wenn Sie eine komplexe Aufgabe planen und organisieren müssen?", "placeholder": "z.B. Schritte planen, Überblick behalten, Termine einhalten..."},
  {"question": "Was möchten Sie in der Logistik-Ausbildung lernen und welche Ziele haben Sie?", "placeholder": "z.B. Lagerverwaltung, Disposition, Führerschein..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Verkehr/Logistik');

-- Holz/Innenausbau
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was begeistert Sie an der Arbeit mit Holz und im Innenausbau?", "placeholder": "z.B. Naturmaterial, Handwerk, etwas erschaffen..."},
  {"question": "Erzählen Sie von einem handwerklichen Projekt, das Ihnen besonders Spass gemacht hat.", "placeholder": "z.B. Möbel gebaut, Werkstatt-Kurs, Renovation..."},
  {"question": "Welche Fähigkeiten möchten Sie in der Ausbildung im Holz-/Innenausbau erlernen?", "placeholder": "z.B. Schreinertechniken, CNC, Oberflächenbehandlung..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Holz/Innenausbau');

-- Nahrung
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was begeistert Sie an der Arbeit mit Lebensmitteln und in der Nahrungsmittelbranche?", "placeholder": "z.B. Backen, Kochen, Qualität, Hygiene..."},
  {"question": "Beschreiben Sie eine Erfahrung beim Kochen oder Backen, die Sie besonders geprägt hat.", "placeholder": "z.B. Familienrezept, Schulprojekt, eigene Kreation..."},
  {"question": "Was möchten Sie in Ihrer Ausbildung in der Nahrungsmittelbranche erreichen?", "placeholder": "z.B. Bäcker-/Konditormeister, neue Techniken, Hygienewissen..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Nahrung');

-- Natur
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was fasziniert Sie an der Arbeit in und mit der Natur?", "placeholder": "z.B. Pflanzen, Tiere, draussen arbeiten, Umweltschutz..."},
  {"question": "Welche Erfahrungen haben Sie bereits mit der Natur gesammelt?", "placeholder": "z.B. Garten, Bauernhof, Wanderungen, Tierpflege..."},
  {"question": "Was möchten Sie in Ihrer Ausbildung im Bereich Natur lernen?", "placeholder": "z.B. Pflanzenkunde, Landschaftspflege, Nachhaltigkeit..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Natur');

-- Bildung/Soziales
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Warum möchten Sie einen Beruf im sozialen Bereich oder in der Bildung erlernen?", "placeholder": "z.B. Menschen unterstützen, Kinder betreuen, Empathie..."},
  {"question": "Beschreiben Sie eine Situation, in der Sie jemandem geholfen haben und was Sie dabei gelernt haben.", "placeholder": "z.B. Nachhilfe, Freiwilligenarbeit, Geschwister betreuen..."},
  {"question": "Welche Fähigkeiten möchten Sie in Ihrer Ausbildung im sozialen Bereich entwickeln?", "placeholder": "z.B. Kommunikation, Konfliktlösung, Pädagogik..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Bildung/Soziales');

-- Planung/Konstruktion
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Was fasziniert Sie an Planung und Konstruktion?", "placeholder": "z.B. technisches Zeichnen, 3D-Modelle, Gebäudeplanung..."},
  {"question": "Beschreiben Sie ein Projekt, bei dem Sie etwas geplant oder konstruiert haben.", "placeholder": "z.B. Modellbau, technische Zeichnung, CAD-Kurs..."},
  {"question": "Welche Kompetenzen möchten Sie in Ihrer Ausbildung im Bereich Planung/Konstruktion erwerben?", "placeholder": "z.B. CAD-Software, Bauplanung, Vermessung..."}
]'::jsonb
WHERE beruf_code IN (SELECT code FROM berufe WHERE field = 'Planung/Konstruktion');

-- Fallback: Any lehrstellen without questions yet (fields not covered above)
UPDATE lehrstellen SET motivation_questions = '[
  {"question": "Warum möchten Sie diese Lehrstelle antreten und was motiviert Sie für diesen Beruf?", "placeholder": "z.B. persönliche Interessen, Erfahrungen, Ziele..."},
  {"question": "Welche Stärken und Erfahrungen bringen Sie für diese Ausbildung mit?", "placeholder": "z.B. Schulprojekte, Hobbys, persönliche Eigenschaften..."},
  {"question": "Was möchten Sie in dieser Ausbildung lernen und wo sehen Sie sich nach der Lehre?", "placeholder": "z.B. Fachkenntnisse, Weiterbildung, Berufsziele..."}
]'::jsonb
WHERE motivation_questions IS NULL OR motivation_questions = '[]'::jsonb;
