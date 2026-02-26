-- Seed: Comprehensive Swiss Berufsschulen (vocational schools)
-- ~130 schools across all 26 cantons
-- Sources: zh.ch, bkd.be.ch, ag.ch, beruf.lu.ch, coiffuresuisse.ch, schulenschweiz.ch

-- Clear existing schools that don't have foreign key references
DELETE FROM berufsschulen WHERE id NOT IN (SELECT DISTINCT berufsschule_id FROM berufsschule_beruf_mapping);

INSERT INTO berufsschulen (name, canton, city, address, postal_code, lat, lng, website, institutional_status) VALUES

-- ═══════════════════════════════════════════════════════════════
-- ZÜRICH (ZH) — 30 Schulen
-- ═══════════════════════════════════════════════════════════════
('Allgemeine Berufsschule Zürich (ABZ)', 'ZH', 'Zürich', 'Badenerstrasse 13', '8004', 47.3770, 8.5280, 'https://www.a-b-z.ch', 'kantonal'),
('Baugewerbliche Berufsschule Zürich (BBZ)', 'ZH', 'Zürich', 'Lagerstrasse 55', '8004', 47.3780, 8.5310, 'https://www.bbzh.ch', 'kantonal'),
('Berufsbildungsschule Winterthur (BBW)', 'ZH', 'Winterthur', 'Wülflingerstrasse 17', '8400', 47.5000, 8.7240, 'https://bbw.ch', 'kantonal'),
('Berufsmaturitätsschule Winterthur (BMSW)', 'ZH', 'Winterthur', 'Rychenbergstrasse 110', '8400', 47.5030, 8.7150, 'https://bms-w.ch', 'kantonal'),
('Berufsfachschule Winterthur (BFS)', 'ZH', 'Winterthur', 'Tösstalstrasse 22', '8400', 47.4990, 8.7260, 'https://www.bfs-winterthur.ch', 'kantonal'),
('Berufsfachschule Uster (BFSU)', 'ZH', 'Uster', 'Berufsschulstrasse 1', '8610', 47.3490, 8.7200, 'https://www.bzu.ch', 'kantonal'),
('Berufsschule für Detailhandel Zürich (BSDPZ)', 'ZH', 'Zürich', 'Niklaus-Konrad-Strasse 20', '8004', 47.3780, 8.5290, 'https://bsdhz.ch', 'kantonal'),
('Berufsmaturitätsschule Zürich (BMZ)', 'ZH', 'Zürich', 'Ausstellungsstrasse 104', '8005', 47.3890, 8.5280, 'https://www.bms-zuerich.ch', 'kantonal'),
('Berufsschule Bülach (BSB)', 'ZH', 'Bülach', 'Schwerzgruebstrasse 28', '8180', 47.5180, 8.5410, 'https://www.bsbuelach.ch', 'kantonal'),
('Berufsfachschule für Lernende mit Hör- und Kommunikationsbehinderung (BSFH)', 'ZH', 'Zürich', 'Militärstrasse 76', '8004', 47.3780, 8.5250, 'https://www.bsfh.ch', 'kantonal'),
('Berufsschule Mode und Gestaltung Zürich (BSMG)', 'ZH', 'Zürich', 'Ausstellungsstrasse 104', '8005', 47.3890, 8.5280, 'https://www.bsmg.ch', 'kantonal'),
('Berufsschule Rüti (BSR)', 'ZH', 'Rüti', 'Schlossbergstrasse 63', '8630', 47.2600, 8.8560, 'https://bsrueti.ch', 'kantonal'),
('Bildungszentrum Limmattal (BZLT)', 'ZH', 'Dietikon', 'Feldstrasse 6', '8953', 47.4040, 8.3980, 'https://bzlt.ch', 'kantonal'),
('Bildungszentrum Zürichsee (BZZ)', 'ZH', 'Horgen', 'Alte Landstrasse 40', '8810', 47.2590, 8.5970, 'https://www.bzz.ch', 'kantonal'),
('Careum Bildungszentrum (CBZ)', 'ZH', 'Zürich', 'Pestalozzistrasse 3', '8032', 47.3770, 8.5510, 'https://www.careum-bildungszentrum.ch', 'privat'),
('Gewerbliche Berufsschule Wetzikon (GBW)', 'ZH', 'Wetzikon', 'Berufsschulstrasse 4', '8620', 47.3270, 8.7970, 'https://www.gbwetzikon.ch', 'kantonal'),
('Mechatronik Schule Winterthur (MSW)', 'ZH', 'Winterthur', 'Zeughausstrasse 56', '8400', 47.4980, 8.7210, 'https://www.msw.ch', 'privat'),
('Schule für Gestaltung Zürich (SfGZ)', 'ZH', 'Zürich', 'Ausstellungsstrasse 104', '8005', 47.3890, 8.5280, 'https://sfgz.ch', 'kantonal'),
('Strickhof Kompetenzzentrum für Bildung und Dienstleistungen', 'ZH', 'Lindau', 'Eschikon 21', '8315', 47.4490, 8.6830, 'https://www.strickhof.ch', 'kantonal'),
('Technische Berufsschule Zürich (TBZ)', 'ZH', 'Zürich', 'Ausstellungsstrasse 70', '8005', 47.3880, 8.5300, 'https://tbz.ch', 'kantonal'),
('Wirtschaftsschule KV Winterthur (WSKVW)', 'ZH', 'Winterthur', 'Tösstalstrasse 37', '8400', 47.4990, 8.7250, 'https://www.wskvw.ch', 'kantonal'),
('KV Zürich Business School', 'ZH', 'Zürich', 'Limmatstrasse 310', '8005', 47.3900, 8.5280, 'https://www.kvz-schule.ch', 'kantonal'),
('Zentrum für Ausbildung im Gesundheitswesen (ZAG)', 'ZH', 'Winterthur', 'Turbinenstrasse 5', '8400', 47.5010, 8.7240, 'https://www.zag.zh.ch', 'kantonal'),
('United School of Sports Zürich', 'ZH', 'Zürich', 'Buckhauserstrasse 40', '8048', 47.3790, 8.4940, 'https://www.unitedschool.ch', 'privat'),

-- ═══════════════════════════════════════════════════════════════
-- BERN (BE) — 22 Schulen
-- ═══════════════════════════════════════════════════════════════
('gibb Berufsfachschule Bern', 'BE', 'Bern', 'Lorrainestrasse 1', '3013', 46.9570, 7.4400, 'https://www.gibb.ch', 'kantonal'),
('Wirtschafts- und Kaderschule WKS KV Bern', 'BE', 'Bern', 'Effingerstrasse 70', '3008', 46.9470, 7.4350, 'https://www.wksbern.ch', 'kantonal'),
('BFF kompetenz.bildung.bern', 'BE', 'Bern', 'Kapellenstrasse 4', '3011', 46.9520, 7.4410, 'https://www.bffbern.ch', 'kantonal'),
('Bildungszentrum für Wirtschaft und Dienstleistung bwd', 'BE', 'Bern', 'Papiermühlestrasse 65', '3014', 46.9560, 7.4530, 'https://www.bwdbern.ch', 'kantonal'),
('be-med Berner Berufsfachschule für medizinische Assistenzberufe', 'BE', 'Bern', 'Könizstrasse 60', '3008', 46.9420, 7.4280, 'https://www.be-med.ch', 'kantonal'),
('Technische Fachschule Bern (TF)', 'BE', 'Bern', 'Lorrainestrasse 3', '3013', 46.9570, 7.4410, 'https://www.tfbern.ch', 'kantonal'),
('Schule für Gestaltung Bern und Biel (SfG BB)', 'BE', 'Bern', 'Schänzlihalde 31', '3013', 46.9560, 7.4380, 'https://www.sfgb-b.ch', 'kantonal'),
('Berufsbildungszentrum BBZ IDM Thun', 'BE', 'Thun', 'Mönchstrasse 30B', '3600', 46.7540, 7.6290, 'https://www.idm.ch', 'kantonal'),
('Wirtschaftsschule Thun (WST)', 'BE', 'Thun', 'Äussere Ringstrasse 38', '3600', 46.7560, 7.6270, 'https://www.wst.ch', 'kantonal'),
('Berufsbildungszentrum BBZ Biel-Bienne', 'BE', 'Biel/Bienne', 'Wasenstrasse 5', '2501', 47.1370, 7.2430, 'https://www.bbz-cfp.ch', 'kantonal'),
('Bildung Formation Biel-Bienne (BFB)', 'BE', 'Biel/Bienne', 'Robert-Walser-Platz 9', '2501', 47.1370, 7.2460, 'https://www.bfb-bielbienne.ch', 'kantonal'),
('Berufsfachschule Langenthal (bfsl)', 'BE', 'Langenthal', 'Weststrasse 26', '4900', 47.2150, 7.7870, 'https://www.bfsl.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum BWZ Lyss', 'BE', 'Lyss', 'Bielstrasse 35', '3250', 47.0710, 7.3080, 'https://www.bwzlyss.ch', 'kantonal'),
('Bildungszentrum Emme (bzemme)', 'BE', 'Burgdorf', 'Zähringerstrasse 13', '3400', 47.0590, 7.6260, 'https://www.bzemme.ch', 'kantonal'),
('Bildungszentrum Interlaken (bzi)', 'BE', 'Interlaken', 'Rosenstrasse 10', '3800', 46.6850, 7.8540, 'https://www.bzi.ch', 'kantonal'),
('Centre de formation professionnelle Berne francophone (ceff)', 'BE', 'Moutier', 'Rue Centrale 55', '2740', 47.2790, 7.3690, 'https://www.ceff.ch', 'kantonal'),
('Berufsfachschule des Detailhandels Bern (bsd)', 'BE', 'Bern', 'Monbijoustrasse 21', '3011', 46.9460, 7.4400, 'https://www.bsd-bern.ch', 'kantonal'),
('INFORAMA Bildungszentrum Landwirtschaft', 'BE', 'Zollikofen', 'Rütti 5', '3052', 46.9970, 7.4540, 'https://www.inforama.ch', 'kantonal'),
('Schule für Holzbildhauerei Brienz', 'BE', 'Brienz', 'Schleegasse 1', '3855', 46.7540, 8.0440, 'https://www.holzbildhauerei.ch', 'kantonal'),
('Gartenbauschule Hünibach', 'BE', 'Hünibach', 'Chartreusestrasse 7', '3626', 46.7310, 7.6540, 'https://www.gartenbauschule-huenibach.ch', 'privat'),

-- ═══════════════════════════════════════════════════════════════
-- LUZERN (LU) — 6 Schulen
-- ═══════════════════════════════════════════════════════════════
('Berufsbildungszentrum Bau und Gewerbe (BBZB)', 'LU', 'Luzern', 'Bahnhofstrasse 24', '6002', 47.0490, 8.3100, 'https://bbzb.lu.ch', 'kantonal'),
('Berufsbildungszentrum Wirtschaft, Informatik und Technik (BBZW)', 'LU', 'Sursee', 'Centralstrasse 21', '6210', 47.1710, 8.1110, 'https://bbzw.lu.ch', 'kantonal'),
('Berufsbildungszentrum Gesundheit und Soziales (BBZG)', 'LU', 'Luzern', 'Abendweg 1', '6006', 47.0440, 8.3130, 'https://bbzg.lu.ch', 'kantonal'),
('Berufsbildungszentrum Natur und Ernährung (BBZN)', 'LU', 'Hohenrain', 'Sennweidstrasse 35', '6276', 47.1770, 8.3180, 'https://bbzn.lu.ch', 'kantonal'),
('Fach- und Wirtschafts-Mittelschulzentrum Luzern (FMZ)', 'LU', 'Luzern', 'Dreilindenstrasse 20', '6006', 47.0440, 8.3190, 'https://fmz.lu.ch', 'kantonal'),
('Zentrum für Brückenangebote Luzern (ZBA)', 'LU', 'Luzern', 'Landenbergstrasse 37', '6005', 47.0520, 8.2990, 'https://zba.lu.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- AARGAU (AG) — 12 Schulen
-- ═══════════════════════════════════════════════════════════════
('Berufsschule Aarau (BSA)', 'AG', 'Aarau', 'Tellistrasse 58', '5001', 47.3890, 8.0530, 'https://www.bs-aarau.ch', 'kantonal'),
('Schule für Gestaltung Aargau', 'AG', 'Aarau', 'Weihermattstrasse 94', '5000', 47.3880, 8.0440, 'https://www.sfgaargau.ch', 'kantonal'),
('Berufsfachschule BBB Baden', 'AG', 'Baden', 'Wiesenstrasse 32', '5400', 47.4730, 8.3060, 'https://www.bbbaden.ch', 'kantonal'),
('zB. Zentrum Bildung – Wirtschaftsschule KV Aargau Ost', 'AG', 'Baden', 'Kreuzlibergstrasse 10', '5400', 47.4730, 8.3080, 'https://www.zentrumbildung.ch', 'kantonal'),
('BWZ Berufs- und Weiterbildungszentrum Brugg', 'AG', 'Brugg', 'Industriestrasse 19', '5200', 47.4860, 8.2070, 'https://www.bwzbrugg.ch', 'kantonal'),
('Berufsfachschule Gesundheit und Soziales Brugg (BFGS)', 'AG', 'Brugg', 'Industriestrasse 19', '5200', 47.4860, 8.2070, 'https://www.bfgs.ch', 'kantonal'),
('HKV Aarau Handelsschule KV', 'AG', 'Aarau', 'Bahnhofstrasse 46', '5001', 47.3900, 8.0510, 'https://www.hkvaarau.ch', 'kantonal'),
('Berufsbildungszentrum Fricktal (BBZ)', 'AG', 'Rheinfelden', 'Kaiserstrasse 25', '4310', 47.5540, 7.7940, 'https://www.bzf.ch', 'kantonal'),
('Berufsbildungszentrum Freiamt (BBZF)', 'AG', 'Wohlen', 'Bremgarterstrasse 37', '5610', 47.3530, 8.2760, 'https://www.bbzf.ch', 'kantonal'),
('Berufsschule Lenzburg', 'AG', 'Lenzburg', 'Neuhofstrasse 36', '5600', 47.3880, 8.1800, 'https://www.bslenzburg.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum Zofingen (BWZ)', 'AG', 'Zofingen', 'Strengelbacherstrasse 27', '4800', 47.2860, 7.9420, 'https://bwzofingen.ch', 'kantonal'),
('Landwirtschaftliches Zentrum Liebegg', 'AG', 'Gränichen', 'Liebegg 1', '5722', 47.3670, 8.0970, 'https://www.liebegg.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- ST. GALLEN (SG) — 8 Schulen
-- ═══════════════════════════════════════════════════════════════
('Gewerbliches Berufs- und Weiterbildungszentrum St. Gallen (GBS)', 'SG', 'St. Gallen', 'Demutstrasse 115', '9012', 47.4260, 9.3830, 'https://www.gbssg.ch', 'kantonal'),
('Kaufmännisches Berufs- und Weiterbildungszentrum St. Gallen (KBZ)', 'SG', 'St. Gallen', 'Kreuzbleicheweg 4', '9000', 47.4260, 9.3740, 'https://www.kbzsg.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum für Gesundheits- und Sozialberufe St. Gallen (BZGS)', 'SG', 'St. Gallen', 'Lindenstrasse 139', '9016', 47.4310, 9.3650, 'https://www.bzgs.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum Rorschach-Rheintal (BZR)', 'SG', 'Rorschach', 'Feldmühlestrasse 28', '9400', 47.4770, 9.4900, 'https://www.bzr.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum Buchs-Sargans (BZB)', 'SG', 'Buchs', 'Hanflandstrasse 17', '9471', 47.1660, 9.4780, 'https://www.bzbs.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum Rapperswil-Jona (BZRJ)', 'SG', 'Rapperswil-Jona', 'Zürcherstrasse 1', '8640', 47.2270, 8.8260, 'https://www.bfrj.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum Toggenburg (BWZT)', 'SG', 'Wattwil', 'Bahnhofstrasse 29', '9630', 47.2990, 9.0870, 'https://www.bwzt.ch', 'kantonal'),
('Berufs- und Weiterbildungszentrum Wil-Uzwil (BZWU)', 'SG', 'Wil', 'Schönaustrasse 64', '9500', 47.4640, 9.0460, 'https://www.bzwu.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- BASEL-STADT (BS) — 4 Schulen
-- ═══════════════════════════════════════════════════════════════
('Allgemeine Gewerbeschule Basel (AGS)', 'BS', 'Basel', 'Vogelsangstrasse 15', '4058', 47.5620, 7.5960, 'https://www.agsbs.ch', 'kantonal'),
('Berufsfachschule Basel (BFS)', 'BS', 'Basel', 'Kohlenberggasse 10', '4051', 47.5530, 7.5870, 'https://www.bfsbs.ch', 'kantonal'),
('Schule für Gestaltung Basel (SfG)', 'BS', 'Basel', 'Vogelsangstrasse 15', '4058', 47.5620, 7.5960, 'https://www.sfgbasel.ch', 'kantonal'),
('Wirtschaftsschule KV Basel', 'BS', 'Basel', 'Aeschengraben 15', '4002', 47.5480, 7.5900, 'https://www.kvbasel.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- BASEL-LANDSCHAFT (BL) — 4 Schulen
-- ═══════════════════════════════════════════════════════════════
('Gewerblich-industrielle Berufsfachschule Liestal (GIBL)', 'BL', 'Liestal', 'Mühlemattstrasse 34', '4410', 47.4840, 7.7350, 'https://www.gibl.ch', 'kantonal'),
('Gewerblich-industrielle Berufsfachschule Muttenz (GIBM)', 'BL', 'Muttenz', 'Gründenstrasse 46', '4132', 47.5220, 7.6380, 'https://www.gibm.ch', 'kantonal'),
('Berufsfachschule Gesundheit Baselland (BFSG)', 'BL', 'Münchenstein', 'Binningerstrasse 2', '4142', 47.5170, 7.6240, 'https://www.bfsg.ch', 'kantonal'),
('Wirtschaftsschule KV Baselland', 'BL', 'Liestal', 'Käppelimattweg 11', '4410', 47.4840, 7.7380, 'https://www.kvbl.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- SOLOTHURN (SO) — 3 Schulen
-- ═══════════════════════════════════════════════════════════════
('Berufsbildungszentrum Solothurn-Grenchen (BBZ)', 'SO', 'Solothurn', 'Kreuzackerstrasse 10', '4500', 47.2080, 7.5380, 'https://www.bbzsolothurn.ch', 'kantonal'),
('Berufsbildungszentrum Olten (BBZ)', 'SO', 'Olten', 'Aarauerstrasse 30', '4600', 47.3500, 7.9070, 'https://www.bbzolten.ch', 'kantonal'),
('Kaufmännische Berufsfachschule Solothurn-Grenchen', 'SO', 'Solothurn', 'Bielstrasse 1', '4500', 47.2060, 7.5360, 'https://www.kbs-solothurn.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- THURGAU (TG) — 3 Schulen
-- ═══════════════════════════════════════════════════════════════
('Bildungszentrum für Technik Frauenfeld (BZT)', 'TG', 'Frauenfeld', 'Kurzenerchingerstrasse 8', '8500', 47.5580, 8.8990, 'https://www.bzt.tg.ch', 'kantonal'),
('Bildungszentrum für Wirtschaft Weinfelden (BZW)', 'TG', 'Weinfelden', 'Schützenstrasse 7', '8570', 47.5670, 9.1050, 'https://www.bzw.ch', 'kantonal'),
('Bildungszentrum für Bau und Mode Kreuzlingen', 'TG', 'Kreuzlingen', 'Gaissbergstrasse 4', '8280', 47.6500, 9.1730, 'https://www.bbm.tg.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- GRAUBÜNDEN (GR) — 5 Schulen
-- ═══════════════════════════════════════════════════════════════
('Gewerbliche Berufsschule Chur (GBC)', 'GR', 'Chur', 'Scalettastrasse 33', '7000', 46.8520, 9.5300, 'https://www.gbchur.ch', 'kantonal'),
('BGS – Bildungszentrum Gesundheit und Soziales Chur', 'GR', 'Chur', 'Gürtelstrasse 42', '7000', 46.8510, 9.5290, 'https://www.bgs-chur.ch', 'kantonal'),
('Kaufmännische Berufsfachschule Chur (KBSC)', 'GR', 'Chur', 'Ringstrasse 34', '7000', 46.8530, 9.5280, 'https://www.kbsc.ch', 'kantonal'),
('Plantahof – Landwirtschaftliche Bildung Graubünden', 'GR', 'Landquart', 'Kantonsstrasse 17', '7302', 46.9660, 9.5570, 'https://www.plantahof.ch', 'kantonal'),
('Gewerbeschule Samedan', 'GR', 'Samedan', 'Quadratscha 18', '7503', 46.5340, 9.8730, 'https://www.bfsamedan.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- ZUG (ZG) — 2 Schulen
-- ═══════════════════════════════════════════════════════════════
('Gewerblich-industrielles Bildungszentrum Zug (GIBZ)', 'ZG', 'Zug', 'Baarerstrasse 100', '6300', 47.1710, 8.5180, 'https://www.gibz.ch', 'kantonal'),
('Kaufmännisches Bildungszentrum Zug (KBZ)', 'ZG', 'Zug', 'Aabachstrasse 7', '6300', 47.1710, 8.5170, 'https://www.kbz-zug.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- SCHWYZ (SZ) — 2 Schulen
-- ═══════════════════════════════════════════════════════════════
('Berufsbildungszentrum Pfäffikon (BBZP)', 'SZ', 'Pfäffikon', 'Goldauer Strasse 2', '8808', 47.2010, 8.7830, 'https://www.bbzp.ch', 'kantonal'),
('Berufsbildungszentrum Goldau (BBZG)', 'SZ', 'Goldau', 'Römerstrasse 1', '6410', 47.0470, 8.5470, 'https://www.bbzg.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- FREIBURG (FR) — 3 Schulen
-- ═══════════════════════════════════════════════════════════════
('Ecole professionnelle artisanale et industrielle Fribourg (EPAI)', 'FR', 'Freiburg', 'Derrière-les-Remparts 5', '1700', 46.8060, 7.1570, 'https://www.epai.ch', 'kantonal'),
('Ecole professionnelle artisanale et commerciale de Bulle (EPAC)', 'FR', 'Bulle', 'Rue de la Condémine 36', '1630', 46.6180, 7.0550, 'https://www.epac.ch', 'kantonal'),
('Ecole professionnelle commerciale Fribourg (EPC)', 'FR', 'Freiburg', 'Rue St-Pierre-Canisius 10', '1700', 46.8060, 7.1580, 'https://www.epcfribourg.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- WALLIS / VALAIS (VS) — 4 Schulen
-- ═══════════════════════════════════════════════════════════════
('Ecole professionnelle de Sion (EPSI)', 'VS', 'Sion', 'Route de Gravelone 1', '1950', 46.2310, 7.3570, 'https://www.epsi.ch', 'kantonal'),
('Ecole professionnelle commerciale et artisanale Sion (EPCA)', 'VS', 'Sion', 'Avenue de France 25', '1950', 46.2330, 7.3580, 'https://www.epca.ch', 'kantonal'),
('Berufsfachschule Oberwallis (BFSO)', 'VS', 'Visp', 'Sandstrasse 11', '3930', 46.2940, 7.8800, 'https://www.bfrso.ch', 'kantonal'),
('Ecole professionnelle technique et des métiers de Sion (EPTM)', 'VS', 'Sion', 'Rue de Lausanne 43', '1950', 46.2330, 7.3590, 'https://www.eptm.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- WAADT / VAUD (VD) — 5 Schulen
-- ═══════════════════════════════════════════════════════════════
('Ecole professionnelle EPSIC Lausanne', 'VD', 'Lausanne', 'Rue de Genève 63', '1004', 46.5270, 6.6110, 'https://www.epsic.ch', 'kantonal'),
('Ecole romande d''arts et communication (ERACOM)', 'VD', 'Lausanne', 'Rue de Genève 55', '1004', 46.5270, 6.6120, 'https://www.eracom.ch', 'kantonal'),
('Ecole professionnelle commerciale de Lausanne (EPCL)', 'VD', 'Lausanne', 'Chemin de Renens 3', '1004', 46.5240, 6.6070, 'https://www.epcl.ch', 'kantonal'),
('Centre d''enseignement professionnel de Vevey (CEPV)', 'VD', 'Vevey', 'Route de Pierre-Ozaire 4', '1800', 46.4620, 6.8440, 'https://www.cepv.ch', 'kantonal'),
('Ecole professionnelle de Nyon (EPN)', 'VD', 'Nyon', 'Route de Divonne 54', '1260', 46.3880, 6.2380, 'https://www.epnyon.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- GENF / GENÈVE (GE) — 4 Schulen
-- ═══════════════════════════════════════════════════════════════
('Centre de formation professionnelle Arts (CFP Arts)', 'GE', 'Genève', 'Rue Necker 2', '1201', 46.2080, 6.1430, 'https://cfp-arts.ch', 'kantonal'),
('Centre de formation professionnelle Technique (CFPT)', 'GE', 'Petit-Lancy', 'Rue du 1er-Juin 8', '1227', 46.1950, 6.1200, 'https://cfpt.ch', 'kantonal'),
('Centre de formation professionnelle Services et Hôtellerie/Restauration (CFP-SHR)', 'GE', 'Petit-Lancy', 'Avenue de la Praille 40', '1227', 46.1920, 6.1230, 'https://cfp-shr.ch', 'kantonal'),
('Centre de formation professionnelle Commerce (CFPC)', 'GE', 'Genève', 'Rue de Carouge 21', '1205', 46.1990, 6.1430, 'https://cfpc.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- NEUENBURG / NEUCHÂTEL (NE) — 2 Schulen
-- ═══════════════════════════════════════════════════════════════
('Centre professionnel du Littoral Neuchâtelois (CPLN)', 'NE', 'Neuchâtel', 'Rue de la Maladière 84', '2000', 46.9920, 6.9320, 'https://www.cpln.ch', 'kantonal'),
('Centre de formation professionnelle neuchâtelois (CPNE)', 'NE', 'Le Locle', 'Rue de l''Avenir 1', '2400', 47.0560, 6.7490, 'https://www.cpne.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- JURA (JU) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Centre de formation professionnelle du Jura (CEPF)', 'JU', 'Delémont', 'Cité des Microtechniques 5', '2800', 47.3640, 7.3440, 'https://www.cepf.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- TESSIN / TICINO (TI) — 4 Schulen
-- ═══════════════════════════════════════════════════════════════
('Scuola Professionale Artigianale e Industriale Locarno (SPAI)', 'TI', 'Locarno', 'Via in Selva 16', '6600', 46.1700, 8.7950, 'https://www.spailocarno.ch', 'kantonal'),
('Centro Professionale Tecnico Lugano (CPT)', 'TI', 'Lugano', 'Via Ferriere 11', '6900', 46.0010, 8.9520, 'https://www.cptlugano.ch', 'kantonal'),
('Centro Professionale Commerciale Lugano (CPC)', 'TI', 'Lugano', 'Via Ferriere 11', '6900', 46.0010, 8.9520, 'https://www.cpclugano.ch', 'kantonal'),
('Scuola Professionale Artigianale e Industriale Bellinzona (SPAI)', 'TI', 'Bellinzona', 'Via Ferriere 10', '6500', 46.1950, 9.0240, 'https://www.spaibellinzona.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- URI (UR) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Berufs- und Weiterbildungszentrum Uri (BWZ)', 'UR', 'Altdorf', 'Attinghauserstrasse 12', '6460', 46.8810, 8.6380, 'https://www.bwzuri.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- OBWALDEN (OW) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Berufs- und Weiterbildungszentrum Obwalden (BWZ)', 'OW', 'Sarnen', 'Brünigstrasse 160', '6060', 46.8930, 8.2450, 'https://www.bwz-ow.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- NIDWALDEN (NW) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Berufsfachschule Nidwalden', 'NW', 'Stans', 'Robert-Durrer-Strasse 5', '6370', 46.9580, 8.3660, 'https://www.bfs-nw.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- GLARUS (GL) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Gewerblich-Industrielle Berufsfachschule Glarus', 'GL', 'Ziegelbrücke', 'Ziegelbrückerstrasse 35', '8866', 47.1330, 9.0680, 'https://www.gibgl.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- SCHAFFHAUSEN (SH) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Berufsbildungszentrum Schaffhausen (BBZ SH)', 'SH', 'Schaffhausen', 'Hintersteig 12', '8200', 47.6960, 8.6360, 'https://www.bbz-sh.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- APPENZELL AUSSERRHODEN (AR) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Berufsbildungszentrum Herisau (BBZ)', 'AR', 'Herisau', 'Brühlgasse 2', '9100', 47.3860, 9.2790, 'https://www.bbz-ar.ch', 'kantonal'),

-- ═══════════════════════════════════════════════════════════════
-- APPENZELL INNERRHODEN (AI) — 1 Schule
-- ═══════════════════════════════════════════════════════════════
('Berufsfachschule Appenzell', 'AI', 'Appenzell', 'Unteres Ziel 20', '9050', 47.3310, 9.4090, 'https://www.bfs-ai.ch', 'kantonal')

ON CONFLICT (id) DO NOTHING;
