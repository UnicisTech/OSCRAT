/**
 * Default sort comparator for any list whose items expose a `createdAt`
 * timestamp. Yields a "newest first" order so the most recently added entry
 * sits on top — the agreed default for all listings in the app.
 */
export function sortByCreatedAtDesc<T extends { createdAt: Date | string }>(
  items: T[] | undefined | null
): T[] {
  if (!items?.length) return [];
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
