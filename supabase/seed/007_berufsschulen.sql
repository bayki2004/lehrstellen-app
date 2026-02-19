-- Seed: Major Swiss Berufsschulen (vocational schools)
-- Real addresses and approximate coordinates

INSERT INTO berufsschulen (name, canton, city, address, postal_code, lat, lng, website) VALUES
-- Zürich
('Berufsbildungsschule Winterthur (BBW)', 'ZH', 'Winterthur', 'Wülflingerstrasse 17', '8400', 47.5000, 8.7240, 'https://www.bbw.ch'),
('Technische Berufsschule Zürich (TBZ)', 'ZH', 'Zürich', 'Ausstellungsstrasse 70', '8005', 47.3880, 8.5300, 'https://www.tbz.ch'),
('Berufsbildungszentrum Zürichsee (BZZ)', 'ZH', 'Horgen', 'Alte Landstrasse 40', '8810', 47.2590, 8.5970, 'https://www.bzz.ch'),
('KV Zürich Business School', 'ZH', 'Zürich', 'Limmatstrasse 310', '8005', 47.3900, 8.5280, 'https://www.kvz-schule.ch'),

-- Bern
('Gewerblich-Industrielle Berufsschule Bern (GIBB)', 'BE', 'Bern', 'Lorrainestrasse 1', '3013', 46.9570, 7.4400, 'https://www.gibb.ch'),
('Wirtschafts- und Kaderschule Bern (WKS)', 'BE', 'Bern', 'Effingerstrasse 70', '3008', 46.9470, 7.4350, 'https://www.wks-be.ch'),
('Berufsbildungszentrum IDM Thun', 'BE', 'Thun', 'Mönchstrasse 30B', '3600', 46.7540, 7.6290, 'https://www.idm.ch'),

-- Luzern
('Berufsbildungszentrum Wirtschaft, Informatik und Technik (BBZW)', 'LU', 'Luzern', 'Robert-Zünd-Strasse 4-6', '6002', 47.0480, 8.3060, 'https://www.bbzw.lu.ch'),

-- Basel
('Allgemeine Gewerbeschule Basel (AGS)', 'BS', 'Basel', 'Vogelsangstrasse 15', '4058', 47.5620, 7.5960, 'https://www.agsbs.ch'),
('Berufsfachschule Basel (BFS)', 'BS', 'Basel', 'Kohlenberggasse 10', '4051', 47.5530, 7.5870, 'https://www.bfsbs.ch'),

-- St. Gallen
('Gewerbliches Berufs- und Weiterbildungszentrum St. Gallen (GBS)', 'SG', 'St. Gallen', 'Demutstrasse 115', '9012', 47.4260, 9.3830, 'https://www.gbssg.ch'),

-- Aargau
('Berufsbildungszentrum Freiamt (BBZ)', 'AG', 'Wohlen', 'Bremgarterstrasse 37', '5610', 47.3530, 8.2760, 'https://www.bbzf.ch'),
('Berufsschule Aarau (BSA)', 'AG', 'Aarau', 'Tellistrasse 58', '5001', 47.3890, 8.0530, 'https://www.bs-aarau.ch'),

-- Solothurn
('Berufsbildungszentrum Solothurn-Grenchen (BBZ)', 'SO', 'Solothurn', 'Kreuzackerstrasse 10', '4500', 47.2080, 7.5380, 'https://www.bbzsolothurn.ch'),

-- Thurgau
('Bildungszentrum für Technik Frauenfeld (BZT)', 'TG', 'Frauenfeld', 'Kurzenerchingerstrasse 8', '8500', 47.5580, 8.8990, 'https://www.bzt.tg.ch'),

-- Graubünden
('Gewerbliche Berufsschule Chur (GBC)', 'GR', 'Chur', 'Scalettastrasse 33', '7000', 46.8520, 9.5300, 'https://www.gbchur.ch'),

-- Zug
('Gewerblich-industrielles Bildungszentrum Zug (GIBZ)', 'ZG', 'Zug', 'Baarerstrasse 100', '6300', 47.1710, 8.5180, 'https://www.gibz.ch'),

-- Schwyz
('Berufsbildungszentrum Pfäffikon (BBZP)', 'SZ', 'Pfäffikon', 'Goldauer Strasse 2', '8808', 47.2010, 8.7830, 'https://www.bbzp.ch'),

-- Freiburg
('Ecole professionnelle artisanale et industrielle (EPAI)', 'FR', 'Freiburg', 'Derrière-les-Remparts 5', '1700', 46.8060, 7.1570, 'https://www.epai.ch'),

-- Valais
('Ecole professionnelle de Sion (EPSI)', 'VS', 'Sion', 'Route de Gravelone 1', '1950', 46.2310, 7.3570, 'https://www.epsi.ch')

ON CONFLICT DO NOTHING;
