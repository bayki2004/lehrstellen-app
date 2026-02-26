/**
 * Canton visual data for Swiss canton badges.
 * Maps each canton code to its official heraldic colors.
 * Used by the CantonBadge component to render colored circle badges.
 */
export const CANTON_DATA: Record<string, { name: string; color: string; textColor: string }> = {
  ZH: { name: 'Zürich', color: '#0F47AF', textColor: '#FFFFFF' },
  BE: { name: 'Bern', color: '#CE1126', textColor: '#FFD700' },
  LU: { name: 'Luzern', color: '#009FE3', textColor: '#FFFFFF' },
  UR: { name: 'Uri', color: '#FFD700', textColor: '#000000' },
  SZ: { name: 'Schwyz', color: '#CE1126', textColor: '#FFFFFF' },
  OW: { name: 'Obwalden', color: '#CE1126', textColor: '#FFFFFF' },
  NW: { name: 'Nidwalden', color: '#CE1126', textColor: '#FFFFFF' },
  GL: { name: 'Glarus', color: '#CE1126', textColor: '#000000' },
  ZG: { name: 'Zug', color: '#009FE3', textColor: '#FFFFFF' },
  FR: { name: 'Freiburg', color: '#000000', textColor: '#FFFFFF' },
  SO: { name: 'Solothurn', color: '#CE1126', textColor: '#FFFFFF' },
  BS: { name: 'Basel-Stadt', color: '#000000', textColor: '#FFFFFF' },
  BL: { name: 'Basel-Land', color: '#CE1126', textColor: '#FFFFFF' },
  SH: { name: 'Schaffhausen', color: '#FFD700', textColor: '#000000' },
  AR: { name: 'Appenzell A.Rh.', color: '#000000', textColor: '#FFFFFF' },
  AI: { name: 'Appenzell I.Rh.', color: '#000000', textColor: '#FFFFFF' },
  SG: { name: 'St. Gallen', color: '#00843D', textColor: '#FFFFFF' },
  GR: { name: 'Graubünden', color: '#808080', textColor: '#FFFFFF' },
  AG: { name: 'Aargau', color: '#0F47AF', textColor: '#FFFFFF' },
  TG: { name: 'Thurgau', color: '#00843D', textColor: '#FFFFFF' },
  TI: { name: 'Tessin', color: '#CE1126', textColor: '#009FE3' },
  VD: { name: 'Waadt', color: '#00843D', textColor: '#FFFFFF' },
  VS: { name: 'Wallis', color: '#CE1126', textColor: '#FFFFFF' },
  NE: { name: 'Neuenburg', color: '#00843D', textColor: '#FFFFFF' },
  GE: { name: 'Genf', color: '#FFD700', textColor: '#CE1126' },
  JU: { name: 'Jura', color: '#CE1126', textColor: '#FFFFFF' },
};
