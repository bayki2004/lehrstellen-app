export interface MapCategory {
  key: string;
  label: string;
  icon: string;
  ionicon: string;
  color: string;
}

export const MAP_CATEGORIES: MapCategory[] = [
  { key: 'Informatik', label: 'Informatik', icon: '💻', ionicon: 'laptop-outline', color: '#2196F3' },
  { key: 'Technik', label: 'Technik', icon: '🔧', ionicon: 'construct-outline', color: '#607D8B' },
  { key: 'Gesundheit', label: 'Gesundheit', icon: '❤️', ionicon: 'heart-outline', color: '#E91E63' },
  { key: 'Kaufmännisch', label: 'KV', icon: '📋', ionicon: 'briefcase-outline', color: '#795548' },
  { key: 'Handwerk', label: 'Handwerk', icon: '🔨', ionicon: 'hammer-outline', color: '#FF9800' },
  { key: 'Gastronomie', label: 'Gastro', icon: '🍽️', ionicon: 'restaurant-outline', color: '#F44336' },
  { key: 'Detailhandel', label: 'Handel', icon: '🛍️', ionicon: 'bag-outline', color: '#9C27B0' },
  { key: 'Design', label: 'Design', icon: '🎨', ionicon: 'brush-outline', color: '#00BCD4' },
  { key: 'Soziales', label: 'Soziales', icon: '🤝', ionicon: 'people-outline', color: '#4CAF50' },
  { key: 'Bau', label: 'Bau', icon: '🏗️', ionicon: 'business-outline', color: '#3F51B5' },
  { key: 'Logistik', label: 'Logistik', icon: '📦', ionicon: 'cube-outline', color: '#FF5722' },
  { key: 'Natur', label: 'Natur', icon: '🌿', ionicon: 'leaf-outline', color: '#8BC34A' },
];

export const MAP_SCHOOL_COLOR = '#FF9800';

// ── Berufsfelder metadata (all 22 fields from berufe table) ─────────
export const BERUFSFELD_META: Record<string, { icon: string; color: string }> = {
  'Bau': { icon: 'construct-outline', color: '#3F51B5' },
  'Bildung/Soziales': { icon: 'people-outline', color: '#4CAF50' },
  'Chemie/Physik': { icon: 'flask-outline', color: '#9C27B0' },
  'Druck': { icon: 'print-outline', color: '#607D8B' },
  'Elektrotechnik': { icon: 'flash-outline', color: '#FF9800' },
  'Fahrzeuge': { icon: 'car-outline', color: '#F44336' },
  'Gastgewerbe': { icon: 'restaurant-outline', color: '#E91E63' },
  'Gebäudetechnik': { icon: 'build-outline', color: '#795548' },
  'Gestaltung/Kunsthandwerk': { icon: 'color-palette-outline', color: '#00BCD4' },
  'Gesundheit': { icon: 'medkit-outline', color: '#E91E63' },
  'Holz/Innenausbau': { icon: 'hammer-outline', color: '#FF9800' },
  'Informatik': { icon: 'desktop-outline', color: '#2196F3' },
  'Kultur/Medien': { icon: 'film-outline', color: '#9C27B0' },
  'Metall/Maschinen/Uhren': { icon: 'cog-outline', color: '#607D8B' },
  'Nahrung': { icon: 'nutrition-outline', color: '#FF5722' },
  'Natur': { icon: 'leaf-outline', color: '#8BC34A' },
  'Planung/Konstruktion': { icon: 'map-outline', color: '#3F51B5' },
  'Schönheit/Sport': { icon: 'fitness-outline', color: '#E91E63' },
  'Textilien/Mode': { icon: 'shirt-outline', color: '#9C27B0' },
  'Verkauf/Einkauf': { icon: 'cart-outline', color: '#795548' },
  'Verkehr/Logistik': { icon: 'bus-outline', color: '#FF5722' },
  'Wirtschaft/Verwaltung': { icon: 'business-outline', color: '#3F51B5' },
};

export function getFieldMeta(field?: string): { icon: string; color: string } {
  if (!field) return { icon: 'briefcase-outline', color: '#9CA3AF' };
  return BERUFSFELD_META[field] ?? { icon: 'briefcase-outline', color: '#9CA3AF' };
}

export function getCategoryColor(field?: string): string {
  if (!field) return '#9CA3AF';
  // Check new BERUFSFELD_META first, then fallback to MAP_CATEGORIES
  const meta = BERUFSFELD_META[field];
  if (meta) return meta.color;
  return MAP_CATEGORIES.find((c) => c.key === field)?.color ?? '#9CA3AF';
}

export function getCategoryIcon(field?: string): string {
  if (!field) return '📌';
  return MAP_CATEGORIES.find((c) => c.key === field)?.icon ?? '📌';
}
