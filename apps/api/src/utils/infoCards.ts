import type { InfoCard } from '@lehrstellen/shared';

/**
 * Generate default InfoCards from lehrstellen `requirements` (JSON string[])
 * and `culture_description` (text) columns.
 */
export function generateDefaultCards(row: {
  requirements?: any;
  culture_description?: string | null;
}): InfoCard[] {
  const cards: InfoCard[] = [];

  // Parse requirements → Anforderungen card
  let reqs: string[] = [];
  if (row.requirements) {
    if (typeof row.requirements === 'string') {
      try {
        reqs = JSON.parse(row.requirements);
      } catch {
        reqs = [];
      }
    } else if (Array.isArray(row.requirements)) {
      reqs = row.requirements;
    }
  }
  if (reqs.length > 0) {
    cards.push({
      type: 'anforderungen',
      title: 'Anforderungen',
      icon: '📋',
      items: reqs,
    });
  }

  // Parse culture_description → Wir bieten card
  if (row.culture_description && typeof row.culture_description === 'string') {
    const sentences = row.culture_description
      .split(/(?<=[.!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (sentences.length > 0) {
      cards.push({
        type: 'wir_bieten',
        title: 'Wir bieten',
        icon: '🎁',
        items: sentences,
      });
    }
  }

  return cards;
}
