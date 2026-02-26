-- ============================================================
-- SEED DATA: Anforderungen & Lehrlingslohn for all 247 Berufe
-- Sets anforderung_mathematik, anforderung_schulsprache,
--      anforderung_naturwissenschaften, anforderung_fremdsprachen (1-4)
--      and lohn_lehrjahre (JSONB array of CHF per Lehrjahr)
-- Scale: 1=Einfach, 2=Mittel, 3=Hoch, 4=Sehr hoch
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- EFZ PROFESSIONS (186)
-- ═══════════════════════════════════════════════════════════════

-- ── Bau ──────────────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'ABD01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'BWT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'BTW01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'FSB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'GRB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'GDB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'GTB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'GLB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'IUB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'MAL01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = '33200';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'PFL01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'PLT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100, 1300]' WHERE code = 'STM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'STB01';

-- ── Bildung/Soziales ────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = '94300';

-- ── Chemie/Physik ───────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = 'APG01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = 'CPT01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[800, 1050, 1300, 1500]' WHERE code = 'KST01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 4, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = 'LAB01';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 4, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[800, 1050, 1300, 1500]' WHERE code = 'PHY01';

-- ── Druck ────────────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'BDT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'DRA01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'MDT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'PAP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'PGR01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'VPD01';

-- ── Elektrotechnik ──────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = '47600';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'ATM01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = '46500';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 4, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'ELK01';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'ELP01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'MEL01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'MME01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'NEL01';

-- ── Fahrzeuge ───────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'AFF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'AME01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'BMM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'BOO01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'BOF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'CLK01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'CRR01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'CSP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'FRM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'FSL01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'ILK01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'LMM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'MGM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'MRM01';

-- ── Gastgewerbe ─────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'FHH01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'HKF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = '79000';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = '79100';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'SGF01';

-- ── Gebäudetechnik ──────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'DCD01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'ENT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'FBU01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'FRT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'FSS01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GBI01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GTH01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GTL01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GTS01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'HZI01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'ISP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'KMF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'KSM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'KSP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'LAB02';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'OFB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'SNI01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'SOI01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'SPG01';

-- ── Gestaltung/Kunsthandwerk ────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'BLI01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'EDF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GGB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GLM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GOS01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = '64700';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GRV01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GWT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'HBH01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'IKR01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = '64800';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'KER01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'KLB01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'KFW01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'ORG01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'PD301';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'SHM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'SLS01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'VGE01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'ZPM01';

-- ── Gesundheit ──────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'AUO01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'DAS01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'FAP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = '86914';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'HSA01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = '86930';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'MPT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'OSM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'ORT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'POD01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'ZHT01';

-- ── Holz/Innenausbau ───────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'BPL01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'GLA01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'HHW01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'HIF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'KUF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'RAU01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = '51700';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = '51200';

-- ── Informatik ──────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = '88900';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[800, 1050, 1300, 1550]' WHERE code = '88611';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[800, 1050, 1300, 1550]' WHERE code = '88612';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[800, 1050, 1300, 1550]' WHERE code = '88613';

-- ── Kultur/Medien ───────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'BUT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'FID01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'FOT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'FMF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'THM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'VFF01';

-- ── Metall/Maschinen/Uhren ──────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'ANF01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'ANL01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'BUM01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'FWO01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'FMB01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'GSF01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'GST01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'MBR01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'MBK01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'MSM01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'MKM01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'MKZ01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'OBB01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'OVU01';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = '45700';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = '45800';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'QMT01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'UHR01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[750, 1000, 1250]' WHERE code = 'UHP01';

-- ── Nahrung ─────────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = '21104';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'BGT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'FLF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'LMT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'MLT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'MUL01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'VPT01';

-- ── Natur ───────────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'FLO01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'FSW01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = '17000';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'GMG01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100, 1300]' WHERE code = 'HFS01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = '15000';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'OBF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'PFF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'TMP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'TPF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'WFF01';

-- ── Planung/Konstruktion ────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'ARM01';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'GEO01';
UPDATE berufe SET anforderung_mathematik = 4, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = 'KON01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[750, 1000, 1250, 1500]' WHERE code = '34500';

-- ── Schönheit/Sport ─────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800, 1000]' WHERE code = 'COI01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800, 1000]' WHERE code = 'FBG01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800, 1000]' WHERE code = 'KOS01';

-- ── Textilien/Mode ──────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'BKG01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050, 1250]' WHERE code = 'FLT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'FTP01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'GWG01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'IPO01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'TXT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850, 1050]' WHERE code = 'WTG01';

-- ── Verkauf/Einkauf ─────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = 'BUH01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200]' WHERE code = '71300';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 3, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 950, 1200, 1400]' WHERE code = 'DRO01';

-- ── Verkehr/Logistik ────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'FBT01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'FOV01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'KBS01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = '95600';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'NAF01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'RCY01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100, 1300]' WHERE code = 'SBM01';
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[700, 900, 1100]' WHERE code = 'STF01';

-- ── Wirtschaft/Verwaltung ───────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = 'EDB01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = 'FKD01';
UPDATE berufe SET anforderung_mathematik = 3, anforderung_schulsprache = 3, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 3, lohn_lehrjahre = '[800, 1050, 1300]' WHERE code = '68500';


-- ═══════════════════════════════════════════════════════════════
-- EBA PROFESSIONS (61)
-- ═══════════════════════════════════════════════════════════════

-- ── Bau EBA ─────────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'ABDE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'FSBE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'GIPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'GLBE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'GRBE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'GDBE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'IUBE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'MLPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'MARE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'PLPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'STSE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'SBPE1';

-- ── Chemie/Physik EBA ───────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'CHPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'KSPE1';

-- ── Druck EBA ───────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'PMPE1';

-- ── Fahrzeuge EBA ───────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'AUTE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'LAKE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'RFPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'ZRAE1';

-- ── Gastgewerbe EBA ─────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 750]' WHERE code = 'KUAE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 750]' WHERE code = 'PHHE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 750]' WHERE code = 'RANE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 750]' WHERE code = 'SGPE1';

-- ── Gebäudetechnik EBA ──────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'DCPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'ENTE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'HZPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'KMPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'LAPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'MSSE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'PRTE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'SNPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'SLME1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'SPPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'UHPE1';

-- ── Gesundheit EBA ──────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 2, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[650, 850]' WHERE code = '86916';

-- ── Holz/Innenausbau EBA ────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'HLBE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'SCPE1';

-- ── Metall/Maschinen/Uhren EBA ──────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'FMPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'MBPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'MCPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'OFPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'POLE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'UHAE1';

-- ── Nahrung EBA ─────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'BKCE';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'FLAE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'LMPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'MLPE2';

-- ── Natur EBA ───────────────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'AGRE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'FLOE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'FSPE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'GTRE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'PFWE1';

-- ── Schönheit/Sport EBA ─────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'COIE1';

-- ── Textilien/Mode EBA ──────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'BKNE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'DKNE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'TXPE1';

-- ── Verkauf/Einkauf EBA ─────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = '71400';

-- ── Verkehr/Logistik EBA ────────────────────────────────────
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = '95700';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'SBLE1';
UPDATE berufe SET anforderung_mathematik = 1, anforderung_schulsprache = 1, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 1, lohn_lehrjahre = '[600, 800]' WHERE code = 'STPE1';

-- ── Wirtschaft/Verwaltung EBA ───────────────────────────────
UPDATE berufe SET anforderung_mathematik = 2, anforderung_schulsprache = 2, anforderung_naturwissenschaften = 1, anforderung_fremdsprachen = 2, lohn_lehrjahre = '[700, 900]' WHERE code = '68600';
