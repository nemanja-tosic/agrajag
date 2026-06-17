import { Page } from '../application/Resolver.js';
import { encodeCursor, decodeCursor } from './Cursor.js';
import { PageParams } from './QueryParams.js';

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

/**
 * Apply cursor pagination to an already-ordered, fully-materialized array. For
 * reference/in-memory resolvers and tests — it loads the whole set, so
 * production resolvers should keyset at the data layer instead (encode the same
 * cursor from the row's sort keys + id, translate `after`/`before` to a WHERE).
 */
export function paginate<T extends { id?: string }>(
  ordered: T[],
  page: PageParams | undefined,
  sortValues: (row: T) => unknown[] = () => [],
): Page<T> {
  const size = Math.max(1, Math.min(page?.size ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE));
  const cursorFor = (row: T): string =>
    encodeCursor({ values: sortValues(row), id: String(row.id) });
  const indexOf = (cursor: string): number => {
    const { id } = decodeCursor(cursor);
    return ordered.findIndex(row => String(row.id) === id);
  };

  let start: number;
  let window: T[];
  let hasNextPage: boolean;
  let hasPreviousPage: boolean;

  if (page?.before) {
    const found = indexOf(page.before);
    const end = found < 0 ? ordered.length : found;
    start = Math.max(0, end - size);
    window = ordered.slice(start, end);
    hasPreviousPage = start > 0;
    hasNextPage = true;
  } else {
    const found = page?.after ? indexOf(page.after) : -1;
    start = page?.after ? (found < 0 ? 0 : found + 1) : 0;
    window = ordered.slice(start, start + size);
    hasPreviousPage = start > 0;
    hasNextPage = ordered.length > start + size;
  }

  return {
    data: window,
    pageInfo: {
      startCursor: window.length ? cursorFor(window[0]!) : undefined,
      endCursor: window.length ? cursorFor(window[window.length - 1]!) : undefined,
      hasNextPage,
      hasPreviousPage,
    },
    total: ordered.length,
  };
}
