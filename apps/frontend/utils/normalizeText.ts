/**
 * Normalizes SCREAMING_SNAKE_CASE text to human-readable format.
 *
 * @example

 * normalizeText('SUPPLY_CHAIN_INCIDENT') // Returns: "Supply Chain Incident"
 * **/

// Normalize the status and type text for display
const normalizeText = (text: string): string => {
  return text
    .split('_')
    .filter((word) => word.length > 0) // Remove empty strings from consecutive underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default normalizeText;
