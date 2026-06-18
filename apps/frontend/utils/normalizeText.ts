/**
 * Normalizes SCREAMING_SNAKE_CASE text to human-readable format.
 * Preserves known uppercase tokens like Roman numerals.
 *
 * @example
 * normalizeText('SUPPLY_CHAIN_INCIDENT')  // "Supply Chain Incident"
 * normalizeText('IMPORTANT_CLASS_II')     // "Important Class II"
 **/

const PRESERVE_UPPERCASE = new Set([
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'ID',
  'CVE',
  'CRA',
  'SBOM',
  'EU',
]);

const normalizeText = (text: string): string => {
  return text
    .split('_')
    .filter((word) => word.length > 0)
    .map((word) => {
      const upper = word.toUpperCase();
      if (PRESERVE_UPPERCASE.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export default normalizeText;
