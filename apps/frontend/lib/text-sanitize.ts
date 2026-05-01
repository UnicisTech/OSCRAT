// Source-of-truth character classes for task-style text fields.
// Validators and auto-generation sanitizers both consume these so they cannot drift.
export const TITLE_CHAR_REGEX = /^[a-zA-Z0-9\s\-_.,()'[\]À-ſ]*$/;
export const DESCRIPTION_CHAR_REGEX = /^[a-zA-Z0-9\s\-_.,()':;@#&+/\\!?\n\rÀ-ſ]*$/;

const TITLE_STRIP_REGEX = /[^a-zA-Z0-9\s\-_.,()'[\]À-ſ]/g;
const DESCRIPTION_STRIP_REGEX = /[^a-zA-Z0-9\s\-_.,()':;@#&+/\\!?\n\rÀ-ſ]/g;

function collapseWhitespace(input: string, preserveNewlines: boolean): string {
  if (preserveNewlines) {
    return input
      .replace(/[ \t\f\v]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .trim();
  }
  return input.replace(/\s+/g, ' ').trim();
}

export function sanitizeForTitle(input: string | null | undefined): string {
  if (!input) return '';
  return collapseWhitespace(input.replace(TITLE_STRIP_REGEX, ' '), false);
}

export function sanitizeForDescription(input: string | null | undefined): string {
  if (!input) return '';
  return collapseWhitespace(input.replace(DESCRIPTION_STRIP_REGEX, ' '), true);
}

export function truncateAtWordBoundary(
  input: string,
  max: number,
  suffix = '...'
): string {
  if (input.length <= max) return input;
  if (max <= suffix.length) return input.slice(0, max);

  const budget = max - suffix.length;
  const slice = input.slice(0, budget);
  const lastBoundary = slice.search(/\s\S*$/);
  const cut = lastBoundary > budget / 2 ? slice.slice(0, lastBoundary) : slice;
  return `${cut.trimEnd()}${suffix}`;
}
