export function getErrorCodeTranslationKey(code: string | undefined): string {
  if (!code) return 'errorCodes.UNKNOWN';
  return `errorCodes.${code}`;
}